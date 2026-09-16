<?php
/**
 * Server-side email templates (fallback when client HTML is not provided).
 */

declare(strict_types=1);

const FOUNDER_NAME = 'Mr. Mohamed Jailani';
const FOUNDER_TITLE = 'Managing Director';
const FOUNDER_CREDENTIALS = 'B.E. Mechanical Engineering · Anna University';
const FOUNDER_PHOTO = 'https://hexcentric.in/assets/images/og/md-mohamed-jailani.webp';
const FOUNDER_PHONE = '+91 80980 99334';
const FOUNDER_QUOTE = 'A client should never have to trust a fabricator blindly. Every decision we make is backed by a calculation they can verify.';

function esc(string $str): string
{
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function email_shell(string $title, string $bodyHtml): string
{
    $adminEmail = 'support@hexcentric.in';
    return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>' . esc($title) . '</title></head>'
        . '<body style="margin:0;padding:0;background:#0D1117;font-family:Inter,Arial,sans-serif;color:#E8EDF0;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;padding:32px 16px;">'
        . '<tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111820;border-radius:12px;border:1px solid #243041;overflow:hidden;">'
        . '<tr><td style="background:#C4622D;padding:20px 28px;"><p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#fff;">Hexcentric Roof Structures</p>'
        . '<p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#fff;">' . esc($title) . '</p></td></tr>'
        . '<tr><td style="padding:28px;">' . $bodyHtml . '</td></tr>'
        . '<tr><td style="padding:16px 28px;background:#0D1117;border-top:1px solid #243041;">'
        . '<p style="margin:0;font-size:12px;color:#8CA0AC;line-height:1.6;">Hexcentric Roof Structures P Ltd · SIDCO, Sundarapuram, Coimbatore – 641021<br>'
        . '+91 80980 99334 · <a href="mailto:' . $adminEmail . '" style="color:#C4622D;">' . $adminEmail . '</a> · <a href="https://hexcentric.in" style="color:#C4622D;">hexcentric.in</a></p>'
        . '</td></tr></table></td></tr></table></body></html>';
}

function build_admin_email(array $data): string
{
    $rows = [
        ['Full Name', $data['name']],
        ['Company', $data['company'] ?: '—'],
        ['Phone', $data['phone']],
        ['Email', $data['email']],
        ['Project Type', $data['projectTypeLabel']],
        ['Project Size', $data['projectSizeLabel'] ?: '—'],
        ['Location', $data['location'] ?: '—'],
        ['Submitted', date('d M Y, h:i A', strtotime($data['timestamp'] ?: 'now')) . ' IST'],
        ['Source Page', $data['source']],
    ];

    $tableRows = '';
    foreach ($rows as [$k, $v]) {
        $tableRows .= '<tr><td style="padding:10px 12px;border-bottom:1px solid #243041;color:#8CA0AC;font-size:13px;font-weight:600;width:140px;vertical-align:top;">'
            . esc($k) . '</td><td style="padding:10px 12px;border-bottom:1px solid #243041;color:#E8EDF0;font-size:14px;">'
            . esc($v) . '</td></tr>';
    }

    $detailsBlock = $data['details']
        ? '<h3 style="margin:20px 0 8px;font-size:14px;color:#C4622D;text-transform:uppercase;letter-spacing:0.06em;">Project Details</h3>'
          . '<p style="margin:0;font-size:14px;line-height:1.7;color:#E8EDF0;white-space:pre-wrap;">' . esc($data['details']) . '</p>'
        : '';

    $body = '<p style="margin:0 0 16px;font-size:15px;color:#E8EDF0;">A new project enquiry has been submitted via the website contact form.</p>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #243041;border-radius:8px;overflow:hidden;">'
        . $tableRows . '</table>' . $detailsBlock
        . '<p style="margin:20px 0 0;"><a href="mailto:' . esc($data['email']) . '" style="display:inline-block;background:#C4622D;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;">Reply to '
        . esc($data['name']) . '</a></p>';

    return email_shell('New Project Enquiry', $body);
}

function build_client_email(array $data): string
{
    $firstName = explode(' ', trim($data['name']))[0];
    $projectLabel = $data['projectTypeLabel'];
    $referenceId = 'HX-' . strtoupper(substr(base_convert((string) time(), 10, 36), -6));

    $body = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">'
        . '<tr><td style="vertical-align:top;width:64px;padding-right:16px;">'
        . '<img src="' . FOUNDER_PHOTO . '" alt="' . esc(FOUNDER_NAME) . '" width="56" height="56" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #C4622D;display:block;">'
        . '</td><td style="vertical-align:top;">'
        . '<p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C4622D;">A Personal Note</p>'
        . '<p style="margin:4px 0 0;font-size:13px;color:#8CA0AC;">From ' . esc(FOUNDER_NAME) . ', ' . esc(FOUNDER_TITLE) . '</p>'
        . '</td></tr></table>'
        . '<p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#E8EDF0;">Dear ' . esc($firstName) . ',</p>'
        . '<p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#B8C5CE;">Thank you for reaching out to Hexcentric. I\'m <strong style="color:#E8EDF0;">Mohamed Jailani</strong>, and I\'ve received your enquiry for <strong style="color:#C4622D;">'
        . esc($projectLabel) . '</strong>. I will personally review your project and call you within <strong style="color:#E8EDF0;">24 business hours</strong>.</p>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1A2332;border-radius:8px;border:1px solid #243041;margin:20px 0;">'
        . '<tr><td style="padding:20px;"><p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#C4622D;text-transform:uppercase;letter-spacing:0.06em;">Your Enquiry Summary</p>'
        . '<p style="margin:0 0 6px;font-size:14px;color:#E8EDF0;"><strong>Reference:</strong> ' . esc($referenceId) . '</p>'
        . '<p style="margin:0 0 6px;font-size:14px;color:#E8EDF0;"><strong>Name:</strong> ' . esc($data['name']) . '</p>'
        . '<p style="margin:0 0 6px;font-size:14px;color:#E8EDF0;"><strong>Project:</strong> ' . esc($projectLabel) . '</p>'
        . ($data['location'] ? '<p style="margin:0 0 6px;font-size:14px;color:#E8EDF0;"><strong>Location:</strong> ' . esc($data['location']) . '</p>' : '')
        . '<p style="margin:0;font-size:14px;color:#E8EDF0;"><strong>Phone:</strong> ' . esc($data['phone']) . '</p>'
        . '</td></tr></table>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;border-radius:8px;border:1px solid #243041;margin-bottom:20px;">'
        . '<tr><td style="padding:20px 24px;">'
        . '<p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#C4622D;text-transform:uppercase;letter-spacing:0.08em;">My Commitment to You</p>'
        . '<p style="margin:0;font-size:14px;line-height:1.75;color:#B8C5CE;font-style:italic;">"' . esc(FOUNDER_QUOTE) . '"</p>'
        . '<p style="margin:10px 0 0;font-size:12px;color:#8CA0AC;">— ' . esc(FOUNDER_NAME) . ', ' . esc(FOUNDER_TITLE) . '</p>'
        . '</td></tr></table>'
        . '<p style="margin:0 0 10px;text-align:center;"><a href="https://wa.me/918098099334" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:700;">Message Me on WhatsApp</a></p>'
        . '<p style="margin:0;text-align:center;"><a href="tel:+918098099334" style="display:inline-block;background:#C4622D;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:700;">Call Me — ' . FOUNDER_PHONE . '</a></p>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #243041;padding-top:20px;">'
        . '<tr><td style="vertical-align:top;width:72px;padding-right:16px;">'
        . '<img src="' . FOUNDER_PHOTO . '" alt="' . esc(FOUNDER_NAME) . '" width="64" height="64" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid #C4622D;display:block;">'
        . '</td><td style="vertical-align:top;">'
        . '<p style="margin:0;font-size:15px;font-weight:700;color:#E8EDF0;">' . esc(FOUNDER_NAME) . '</p>'
        . '<p style="margin:3px 0 0;font-size:12px;font-weight:600;color:#C4622D;">' . esc(FOUNDER_TITLE) . ' · Hexcentric Roof Structures</p>'
        . '<p style="margin:6px 0 0;font-size:12px;color:#8CA0AC;">' . esc(FOUNDER_CREDENTIALS) . '</p>'
        . '</td></tr></table>';

    return email_shell('A Personal Note — Your Enquiry is Confirmed', $body);
}
