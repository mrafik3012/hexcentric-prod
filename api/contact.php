<?php
/**
 * Hexcentric Roof Structures — Contact Form API
 * Receives enquiry JSON, sends admin notification + client confirmation.
 * Designed for Hostinger (PHP mail() with domain email).
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

const ADMIN_EMAIL = 'support@hexcentric.in';
const FROM_EMAIL = 'support@hexcentric.in';
const FROM_NAME = 'Hexcentric Roof Structures';
const SITE_URL = 'https://hexcentric.in';

/* ─── Honeypot ──────────────────────────────────────────────────── */
$honeypot = trim((string) ($data['website_hp'] ?? ''));
if ($honeypot !== '') {
    echo json_encode(['success' => true]);
    exit;
}

/* ─── Validation ────────────────────────────────────────────────── */
$fields = $data['fields'] ?? $data;
$name = trim((string) ($fields['name'] ?? ''));
$phone = trim((string) ($fields['phone'] ?? ''));
$email = trim((string) ($fields['email'] ?? ''));
$company = trim((string) ($fields['company'] ?? ''));
$projectType = trim((string) ($fields['project_type'] ?? ''));
$projectSize = trim((string) ($fields['project_size'] ?? ''));
$location = trim((string) ($fields['location'] ?? ''));
$details = trim((string) ($fields['details'] ?? ''));
$source = trim((string) ($fields['source'] ?? SITE_URL . '/contact'));
$timestamp = trim((string) ($fields['timestamp'] ?? date('c')));

$projectTypeLabel = trim((string) ($fields['project_type_label'] ?? $projectType));
$projectSizeLabel = trim((string) ($fields['project_size_label'] ?? $projectSize));

$errors = [];
if ($name === '') $errors[] = 'Name is required';
if ($phone === '') $errors[] = 'Phone is required';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required';
if ($projectType === '') $errors[] = 'Project type is required';

if ($phone !== '') {
    $digits = preg_replace('/\D/', '', $phone);
    if (strlen($digits) < 10) $errors[] = 'Phone must have at least 10 digits';
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => implode('. ', $errors)]);
    exit;
}

/* ─── Use client-built HTML or fall back to server templates ─────── */
$adminHtml = (string) ($data['admin_html'] ?? '');
$clientHtml = (string) ($data['client_html'] ?? '');
$adminSubject = (string) ($data['admin_subject'] ?? "New Enquiry — {$name} ({$projectTypeLabel})");
$clientSubject = (string) ($data['client_subject'] ?? 'A Personal Note from Mr. Jailani — Your Enquiry is Confirmed');

if ($adminHtml === '' || $clientHtml === '') {
    require_once __DIR__ . '/email-templates.php';
    $payload = compact('name', 'phone', 'email', 'company', 'projectType', 'projectSize', 'location', 'details', 'source', 'timestamp', 'projectTypeLabel', 'projectSizeLabel');
    $adminHtml = build_admin_email($payload);
    $clientHtml = build_client_email($payload);
}

/* ─── Send emails ───────────────────────────────────────────────── */
$adminSent = send_html_mail(ADMIN_EMAIL, $adminSubject, $adminHtml, $email, $name);
$clientSent = send_html_mail($email, $clientSubject, $clientHtml, ADMIN_EMAIL, FROM_NAME);

if (!$adminSent && !$clientSent) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Unable to send email. Please call +91 80980 99334 or email ' . ADMIN_EMAIL,
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'admin_sent' => $adminSent,
    'client_sent' => $clientSent,
]);

/* ─── Helpers ─────────────────────────────────────────────────────── */

function send_html_mail(string $to, string $subject, string $html, ?string $replyTo = null, ?string $replyName = null): bool
{
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $from = FROM_NAME . ' <' . FROM_EMAIL . '>';

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $from,
        'X-Mailer: Hexcentric-Contact-Form',
    ];

    if ($replyTo) {
        $replyHeader = $replyName ? "{$replyName} <{$replyTo}>" : $replyTo;
        $headers[] = 'Reply-To: ' . $replyHeader;
    }

    return @mail($to, $encodedSubject, $html, implode("\r\n", $headers));
}
