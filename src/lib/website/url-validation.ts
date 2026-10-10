import { z } from 'zod';
import { isIP, parseURL } from 'node:util';
import { resolve } from 'node:dns/promises';

/**
 * URL Validation & SSRF Protection
 * Validates URLs against multiple security criteria to prevent SSRF attacks
 */

const PRIVATE_IPV4_RANGES = [
  [0, 16777215],           // 0.0.0.0/8
  [167772160, 184549375],  // 10.0.0.0/8
  [2130706432, 2147483647],// 127.0.0.0/8
  [2886729728, 2887778303],// 172.16.0.0/12
  [3232235520, 3232301055],// 192.168.0.0/16
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
  'metadata.google.internal',
  'metadata.gstatic.com',
  'instance-data',
  'api.metadata.google.internal',
];

const BLOCKED_PROTOCOLS = ['file:', 'ftp:', 'data:', 'javascript:', 'about:'];

function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function isPrivateIPv4(ip: string): boolean {
  try {
    const num = ipToNumber(ip);
    return PRIVATE_IPV4_RANGES.some(([start, end]) => num >= start && num <= end);
  } catch {
    return false;
  }
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/[\[\]]/g, '');
  const privateV6Prefixes = ['fe80:', 'fc00:', 'fd00:', '::1'];
  return privateV6Prefixes.some(prefix => normalized.startsWith(prefix));
}

function isBlockedHostname(host: string): boolean {
  const lower = host.toLowerCase();
  return BLOCKED_HOSTNAMES.includes(lower) || BLOCKED_HOSTNAMES.includes(lower.replace(/:\d+$/, ''));
}

async function resolveAndValidateHost(host: string): Promise<void> {
  try {
    const addresses = await resolve(host, 'A');
    for (const addr of addresses) {
      if (isPrivateIPv4(addr) || isBlockedHostname(addr)) {
        throw new Error(`Hostname resolves to private/blocked IP: ${addr}`);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      // DNS failure - could be invalid domain or network issue
      // Allow it to proceed to HTTP validation which will properly fail
      return;
    }
    throw error;
  }
}

export async function validateUrl(url: string): Promise<{ valid: true; normalizedUrl: string } | { valid: false; error: string }> {
  try {
    // Basic URL parsing
    const parsed = new URL(url);
    const protocol = parsed.protocol.toLowerCase();

    // 1. Check protocol
    if (!protocol.startsWith('http')) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are supported' };
    }

    // 2. Check for blocked protocols in full URL string
    if (BLOCKED_PROTOCOLS.some(p => url.toLowerCase().includes(p))) {
      return { valid: false, error: 'URL uses a blocked protocol' };
    }

    // 3. Check hostname
    const hostname = parsed.hostname || '';

    if (!hostname) {
      return { valid: false, error: 'URL has no valid hostname' };
    }

    if (isBlockedHostname(hostname)) {
      return { valid: false, error: 'This hostname is not allowed' };
    }

    // 4. Check if IP address (direct or resolved)
    if (isIP(hostname)) {
      if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
        return { valid: false, error: 'Private/internal IP addresses are not allowed' };
      }
    } else {
      // 5. Try to resolve hostname and check result
      try {
        await resolveAndValidateHost(hostname);
      } catch (error) {
        return {
          valid: false,
          error: `Hostname validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }

    // 6. Return normalized URL
    const normalizedUrl = parsed.toString();

    return { valid: true, normalizedUrl };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid URL: ${error instanceof Error ? error.message : 'Parse error'}`,
    };
  }
}

export const UrlValidationSchema = z
  .string()
  .min(10, 'URL must be at least 10 characters')
  .max(2048, 'URL must be less than 2048 characters')
  .refine(
    url => url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://') || url.toLowerCase().startsWith('www.'),
    'URL must start with http://, https://, or www.'
  );

export type UrlValidationResult = Awaited<ReturnType<typeof validateUrl>>;
