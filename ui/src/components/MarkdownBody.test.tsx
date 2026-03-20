// @vitest-environment node

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "../context/ThemeContext";
import { MarkdownBody } from "./MarkdownBody";

describe("MarkdownBody", () => {
  it("renders markdown images without a resolver", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <MarkdownBody>{"![](/api/attachments/test/content)"}</MarkdownBody>
      </ThemeProvider>,
    );

    expect(html).toContain('<img src="/api/attachments/test/content" alt=""/>');
  });

  it("resolves relative image paths when a resolver is provided", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <MarkdownBody resolveImageSrc={(src) => `/resolved/${src}`}>
          {"![Org chart](images/org-chart.png)"}
        </MarkdownBody>
      </ThemeProvider>,
    );

    expect(html).toContain('src="/resolved/images/org-chart.png"');
    expect(html).toContain('alt="Org chart"');
  });

  describe("local file path links", () => {
    it.each([
      ["absolute /Users/ path", "[file.sh](/Users/diego/Dev/file.sh)"],
      ["absolute /home/ path", "[notes.md](/home/user/notes.md)"],
      ["absolute /tmp/ path", "[out.log](/tmp/out.log)"],
      ["absolute /var/ path", "[config](/var/config)"],
      ["absolute /opt/ path", "[bin](/opt/bin)"],
      ["absolute /etc/ path", "[hosts](/etc/hosts)"],
      ["tilde path", "[rc](~/dotfiles/.bashrc)"],
      ["relative ./ path", "[script](./scripts/run.sh)"],
      ["relative ../ path", "[lib](../lib/utils.ts)"],
    ])("renders %s as inline code, not a link", (_label, markdown) => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <MarkdownBody>{markdown}</MarkdownBody>
        </ThemeProvider>,
      );
      expect(html).not.toContain("<a ");
      expect(html).toContain("<code>");
    });

    it.each([
      ["https URL", "[GitHub](https://github.com)"],
      ["http URL", "[Site](http://example.com)"],
      ["app-internal path", "[Issues](/issues)"],
      ["api path", "[API](/api/health)"],
    ])("renders %s as a normal link", (_label, markdown) => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <MarkdownBody>{markdown}</MarkdownBody>
        </ThemeProvider>,
      );
      expect(html).toContain("<a ");
      expect(html).not.toContain("<code>");
    });
  });
});

