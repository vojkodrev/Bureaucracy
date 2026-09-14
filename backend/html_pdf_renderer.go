package main

import (
	"bytes"
	"context"
	"fmt"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
)

type HTMLPDFRenderer struct {
	chromePath string
}

func NewHTMLPDFRenderer() *HTMLPDFRenderer {
	return &HTMLPDFRenderer{chromePath: findChromeExecutable()}
}

func (renderer *HTMLPDFRenderer) Render(ctx context.Context, htmlDocument []byte) ([]byte, error) {
	if renderer.chromePath == "" {
		return nil, fmt.Errorf("Chrome is required to generate PDFs; set CHROME_PATH")
	}
	temporaryDirectory, err := os.MkdirTemp("", "bureaucracy-pdf-*")
	if err != nil {
		return nil, fmt.Errorf("create PDF directory: %w", err)
	}
	defer os.RemoveAll(temporaryDirectory)
	htmlPath := filepath.Join(temporaryDirectory, "document.html")
	if err := os.WriteFile(htmlPath, htmlDocument, 0o600); err != nil {
		return nil, fmt.Errorf("write PDF source HTML: %w", err)
	}

	options := append(chromedp.DefaultExecAllocatorOptions[:], chromedp.ExecPath(renderer.chromePath), chromedp.Flag("disable-dev-shm-usage", true), chromedp.UserDataDir(filepath.Join(temporaryDirectory, "chrome-profile")))
	allocatorContext, cancelAllocator := chromedp.NewExecAllocator(ctx, options...)
	defer cancelAllocator()
	browserContext, cancelBrowser := chromedp.NewContext(allocatorContext)
	defer cancelBrowser()
	browserContext, cancelTimeout := context.WithTimeout(browserContext, 30*time.Second)
	defer cancelTimeout()
	var pdf []byte
	if err := chromedp.Run(browserContext, chromedp.Navigate(localDocumentURL(htmlPath)), chromedp.WaitReady("body"), chromedp.ActionFunc(func(ctx context.Context) error {
		var err error
		pdf, _, err = page.PrintToPDF().WithPrintBackground(true).WithPreferCSSPageSize(true).Do(ctx)
		return err
	})); err != nil {
		return nil, fmt.Errorf("generate PDF: %w", err)
	}
	if !bytes.HasPrefix(pdf, []byte("%PDF-")) {
		return nil, fmt.Errorf("Chrome returned an invalid PDF")
	}
	return pdf, nil
}

func localDocumentURL(filePath string) string {
	urlPath := filepath.ToSlash(filePath)
	if len(filePath) >= 3 && filePath[1] == ':' && (filePath[2] == '\\' || filePath[2] == '/') {
		urlPath = "/" + strings.ReplaceAll(filePath, "\\", "/")
	}
	return (&url.URL{Scheme: "file", Path: urlPath}).String()
}

func findChromeExecutable() string {
	if path := strings.TrimSpace(os.Getenv("CHROME_PATH")); path != "" {
		return path
	}
	for _, name := range []string{"google-chrome", "google-chrome-stable", "chrome", "chromium", "chromium-browser", "microsoft-edge", "msedge", "brave-browser", "brave"} {
		if path, err := exec.LookPath(name); err == nil {
			return path
		}
	}
	for _, path := range installedChromePaths() {
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			return path
		}
	}
	return ""
}

func installedChromePaths() []string {
	switch runtime.GOOS {
	case "darwin":
		return []string{"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge", "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"}
	case "windows":
		var paths []string
		for _, base := range []string{os.Getenv("LOCALAPPDATA"), os.Getenv("ProgramFiles"), os.Getenv("ProgramFiles(x86)")} {
			if base != "" {
				paths = append(paths, filepath.Join(base, "Google", "Chrome", "Application", "chrome.exe"), filepath.Join(base, "Chromium", "Application", "chrome.exe"), filepath.Join(base, "Microsoft", "Edge", "Application", "msedge.exe"), filepath.Join(base, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"))
			}
		}
		return paths
	default:
		return []string{"/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge", "/usr/bin/brave-browser", "/snap/bin/chromium"}
	}
}
