// src/app/u/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';

export const alt = 'Developer Passport';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Helper to get initials
function getInitials(name: string): string {
  const names = name.split(' ');
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

// Safely fetch avatar as base64 data URI for Satori
async function fetchAvatarSrc(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/png';
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch {
    // CORS, broken link, timeout — fail gracefully
    return null;
  }
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OGImage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      image: true,
      developerTitle: true,
      currentStreak: true,
      longestStreak: true,
      badges: true,
      isPublicProfile: true,
    },
  });

  // Fallback for missing or private users
  const name = user?.name || 'Seniofy Developer';
  const title = user?.developerTitle || 'Initiate';
  const streak = user?.currentStreak || 0;
  const longestStreak = user?.longestStreak || 0;
  const badgeCount = user?.badges?.length || 0;
  const isPublic = user?.isPublicProfile !== false;

  // Attempt to fetch the avatar image
  let avatarSrc: string | null = null;
  if (user?.image && isPublic) {
    avatarSrc = await fetchAvatarSrc(user.image);
  }

  const initials = getInitials(name);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#020617',
          border: '1px solid #1e293b',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)',
            display: 'flex',
          }}
        />

        {/* Main content card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 60px',
            width: '100%',
          }}
        >
          {/* Avatar */}
          {avatarSrc ? (
            <img
              src={avatarSrc}
              width={120}
              height={120}
              style={{
                borderRadius: '50%',
                border: '3px solid #3b82f6',
                objectFit: 'cover',
                marginBottom: '24px',
              }}
            />
          ) : (
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '3px solid #3b82f6',
                backgroundColor: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
                  fontSize: '40px',
                  fontWeight: 800,
                  color: '#3b82f6',
                }}
              >
                {initials}
              </span>
            </div>
          )}

          {/* Name */}
          <div
            style={{
              fontSize: '52px',
              fontWeight: 800,
              color: '#f8fafc',
              lineHeight: 1.1,
              textAlign: 'center',
              marginBottom: '8px',
              display: 'flex',
            }}
          >
            {isPublic ? name : 'Private Profile'}
          </div>

          {/* Developer Title */}
          {isPublic && (
            <div
              style={{
                fontSize: '26px',
                fontWeight: 600,
                color: '#3b82f6',
                textAlign: 'center',
                marginBottom: '36px',
                display: 'flex',
              }}
            >
              {title}
            </div>
          )}

          {/* Stats Row */}
          {isPublic && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '48px',
              }}
            >
              {/* Streak */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>🔥</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#f8fafc',
                    }}
                  >
                    {streak}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Day Streak
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: '1px',
                  height: '48px',
                  backgroundColor: '#334155',
                  display: 'flex',
                }}
              />

              {/* Longest Streak */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>🏆</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#f8fafc',
                    }}
                  >
                    {longestStreak}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Best Streak
                  </span>
                </div>
              </div>

              {/* Divider */}
              {badgeCount > 0 && (
                <>
                  <div
                    style={{
                      width: '1px',
                      height: '48px',
                      backgroundColor: '#334155',
                      display: 'flex',
                    }}
                  />
                  {/* Badges */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>🎖️</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          fontSize: '28px',
                          fontWeight: 700,
                          color: '#f8fafc',
                        }}
                      >
                        {badgeCount}
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {badgeCount === 1 ? 'Badge' : 'Badges'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Branding — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              color: '#475569',
              fontWeight: 500,
            }}
          >
            seniofy.com
          </span>
        </div>

        {/* "Developer Passport" label — bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              color: '#334155',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            Developer Passport
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
