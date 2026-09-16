<?php
/**
 * Server-side email templates (fallback when client HTML is not provided).
 */

declare(strict_types=1);

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

    $body = '<p style="margin:0 0 16px;font-size:16px;color:#E8EDF0;">Dear ' . esc($firstName) . ',</p>'
        . '<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#E8EDF0;">Thank you for contacting <strong>Hexcentric Roof Structures</strong>. We have received your enquiry regarding <strong>'
        . esc($projectLabel) . '</strong> and our engineering team is reviewing the details.</p>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1A2332;border-radius:8px;border:1px solid #243041;margin:20px 0;">'
        . '<tr><td style="padding:20px;"><p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#C4622D;text-transform:uppercase;letter-spacing:0.06em;">Your Submission Summary</p>'
        . '<p style="margin:0 0 6px;font-size:14px;color:#E8EDF0;"><strong>Name:</strong> ' . esc($data['name']) . '</p>'
        . '<p style="margin:0 0 6px;font-size:14px;color:#E8EDF0;"><strong>Project:</strong> ' . esc($projectLabel) . '</p>'
        . ($data['location'] ? '<p style="margin:0 0 6px;font-size:14px;color:#E8EDF0;"><strong>Location:</strong> ' . esc($data['location']) . '</p>' : '')
        . '<p style="margin:0;font-size:14px;color:#E8EDF0;"><strong>Phone:</strong> ' . esc($data['phone']) . '</p>'
        . '</td></tr></table>'
        . '<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#E8EDF0;"><strong>What happens next?</strong><br>One of our structural engineers will contact you within <strong>24 business hours</strong>.</p>';

    return email_shell('Thank You for Your Enquiry', $body);
}
