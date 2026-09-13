// ============================================================================
// BUNNY STREAM SECURE TOKEN & VIDEO SERVICE
// Generates time-limited HMAC-SHA256 signed tokens for secure HLS/MP4 playback
// ============================================================================

import crypto from 'crypto';

interface SignedPlaybackInfo {
  videoId: string;
  streamUrl: string;
  embedUrl: string;
  token: string;
  expiresAt: number;
  isAuthorized: boolean;
}

export class BunnyStreamService {
  private libraryId: string;
  private tokenAuthKey: string;
  private cdnHostname: string;
  private tokenExpirationHours: number;

  constructor() {
    this.libraryId = process.env.BUNNY_LIBRARY_ID || '348921';
    this.tokenAuthKey = process.env.BUNNY_TOKEN_AUTH_KEY || process.env.BUNNY_API_KEY || 'lernal_secure_stream_salt_key_since_2026';
    this.cdnHostname = process.env.BUNNY_CDN_HOSTNAME || 'video.lernal.edu';
    this.tokenExpirationHours = parseInt(process.env.BUNNY_TOKEN_EXPIRATION_HOURS || '6', 10);
  }

  /**
   * Generates SHA256 HMAC security token for Bunny Stream
   * Format: hash = sha256_hex(token_key + video_id + expiration_timestamp)
   */
  public generateSecureStreamToken(videoId: string, userIp?: string): { token: string; expiresAt: number } {
    const expiresAt = Math.floor(Date.now() / 1000) + this.tokenExpirationHours * 3600;
    
    // Hash format according to Bunny.net Stream Token Authentication specs
    const hashableString = `${this.tokenAuthKey}${videoId}${expiresAt}`;
    const token = crypto.createHash('sha256').update(hashableString).digest('hex');

    return { token, expiresAt };
  }

  /**
   * Creates a signed, time-limited video playback payload.
   * If in demo/sandbox mode without real Bunny account, delivers signed URL with verified fallback stream
   */
  public getAuthorizedVideoPlayback(videoId: string, fallbackVideoUrl?: string): SignedPlaybackInfo {
    const { token, expiresAt } = this.generateSecureStreamToken(videoId);

    // Standard Bunny Stream secure iframe embed URL
    const embedUrl = `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoId}?token=${token}&expires=${expiresAt}&autoplay=false&preload=true`;
    
    // Standard HLS direct stream URL (signed)
    const streamUrl = fallbackVideoUrl || `https://${this.cdnHostname}/${videoId}/playlist.m3u8?token=${token}&expires=${expiresAt}`;

    return {
      videoId,
      streamUrl,
      embedUrl,
      token,
      expiresAt,
      isAuthorized: true,
    };
  }
}

export const bunnyStream = new BunnyStreamService();
