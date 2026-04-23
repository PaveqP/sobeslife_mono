package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/sirupsen/logrus"
)

// EmailSender sends transactional emails.
// Set RESEND_API_KEY + RESEND_FROM_EMAIL env vars to enable real delivery.
// Without them, codes are logged to stdout (dev mode).
type EmailSender interface {
	SendOTPEmail(ctx context.Context, to, code string) error
}

// --- Resend implementation (production) ---

type resendEmailSender struct {
	apiKey string
	from   string
}

func newResendEmailSender(apiKey, from string) *resendEmailSender {
	return &resendEmailSender{apiKey: apiKey, from: from}
}

func (r *resendEmailSender) SendOTPEmail(ctx context.Context, to, code string) error {
	payload := map[string]interface{}{
		"from":    r.from,
		"to":      []string{to},
		"subject": "Ваш код входа в Sobeslife",
		"html": fmt.Sprintf(`
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
  <h2 style="margin:0 0 8px">Sobeslife</h2>
  <p style="color:#6b7280;margin:0 0 24px">Код для входа:</p>
  <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;margin-bottom:24px">%s</div>
  <p style="color:#6b7280;font-size:14px">Код действителен 10 минут. Если вы не запрашивали вход — просто проигнорируйте это письмо.</p>
</div>`, code),
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+r.apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("resend request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend error %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}

// --- Log implementation (development fallback) ---

type logEmailSender struct{}

func newLogEmailSender() *logEmailSender { return &logEmailSender{} }

func (l *logEmailSender) SendOTPEmail(_ context.Context, to, code string) error {
	logrus.Infof("[OTP-DEV] Code for %s → %s  (set RESEND_API_KEY + RESEND_FROM_EMAIL for real delivery)", to, code)
	return nil
}
