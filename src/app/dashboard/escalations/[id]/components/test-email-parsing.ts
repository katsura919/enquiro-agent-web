// Test utility for email parsing
import { parseEmailContent } from './emailUtils';

// Sample email body from your backend response based on the user's actual email
const sampleEmailBody = `On Fri, Aug 22, 2025 at 2:46 PM Jan Paul Llatuna <janllatuna27@gmail.com>
wrote:

> asdasdasdasda
>
> On Fri, Aug 22, 2025 at 2:45 PM <katsuragik919@gmail.com> wrote:
>
>> helloowasda assdas
>
<div dir="ltr"><br></div><br><div class="gmail_quote gmail_quote_container"><div dir="ltr" class="gmail_attr">On Fri, Aug 22, 2025 at 2:46 PM Jan Paul Llatuna &lt;<a href="mailto:janllatuna27@gmail.com">janllatuna27@gmail.com</a>&gt; wrote:<br></div><blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"><div dir="ltr">asdasdasdasda </div><br><div class="gmail_quote"><div dir="ltr" class="gmail_attr">On Fri, Aug 22, 2025 at 2:45 PM &lt;<a href="mailto:katsuragik919@gmail.com" target="_blank">katsuragik919@gmail.com</a>&gt; wrote:<br></div><blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"> helloowasda assdas</blockquote></div></blockquote></div>`;

export function testEmailParsing() {
  console.log('Testing email parsing...');
  
  const result = parseEmailContent(sampleEmailBody);
  
  console.log('Original email body:');
  console.log(sampleEmailBody);
  console.log('\n--- Parsed Results ---');
  console.log('Main content:', result.mainContent);
  console.log('Quoted content:', result.quotedContent);
  console.log('Is HTML:', result.isHTML);
  
  return result;
}

// Export for console testing
(window as any).testEmailParsing = testEmailParsing;
