// Test utility for email parsing
import { parseEmailContent } from './emailUtils';

// Sample email body from your backend response
const sampleEmailBody = `<div dir="ltr">Thank you for contacting us! We&#39;ve received your inquiry and our team will get back to you shortly.<br><br>Best regards,<br>Support Team</div><br><div class="gmail_quote"><div dir="ltr" class="gmail_attr">On Tue, Dec 17, 2024 at 8:31 PM Test User &lt;<a href="mailto:test@example.com">test@example.com</a>&gt; wrote:<br></div><blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px #ccc solid;padding-left:1ex"><div dir="ltr">Hi,<br><br>I&#39;m having an issue with my account and need some assistance. Could you please help me resolve this?<br><br>Thanks,<br>Test User</div>
</blockquote></div>`;

export function testEmailParsing() {
  console.log('Testing email parsing...');
  
  const result = parseEmailContent(sampleEmailBody);
  
  console.log('Main content:', result.mainContent);
  console.log('Quoted content:', result.quotedContent);
  console.log('Is HTML:', result.isHTML);
  
  return result;
}

// Export for console testing
(window as any).testEmailParsing = testEmailParsing;
