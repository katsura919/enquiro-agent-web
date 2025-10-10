// Utility functions for handling Gmail-style email formatting

export function parseEmailContent(body: string) {
  // Check if the body contains HTML
  const isHTML = /<[a-z][\s\S]*>/i.test(body);
  
  if (isHTML) {
    return parseHTMLEmailContent(body);
  } else {
    return parsePlainTextEmailContent(body);
  }
}

function parseHTMLEmailContent(htmlBody: string) {
  // Extract the main content (before the quoted section)
  const mainContent = extractMainContent(htmlBody);
  const quotedContent = extractQuotedContent(htmlBody);
  
  return {
    mainContent: cleanHTML(mainContent),
    quotedContent: quotedContent ? cleanHTML(quotedContent) : null,
    isHTML: true
  };
}

function parsePlainTextEmailContent(plainBody: string) {
  // Split by common email reply patterns
  const patterns = [
    /\r?\n\r?\nOn .+ wrote:\r?\n/,
    /\r?\n\r?\n> /,
    /\r?\n\r?\n----- Original Message -----/,
    /\r?\n\r?\nFrom: /
  ];
  
  let mainContent = plainBody;
  let quotedContent = null;
  
  for (const pattern of patterns) {
    const match = plainBody.match(pattern);
    if (match && match.index !== undefined) {
      mainContent = plainBody.substring(0, match.index).trim();
      quotedContent = plainBody.substring(match.index).trim();
      break;
    }
  }
  
  return {
    mainContent: mainContent.replace(/\r\n/g, '\n'),
    quotedContent,
    isHTML: false
  };
}

function extractMainContent(htmlBody: string) {
  // Find the main content before Gmail quote structure
  let content = htmlBody;
  
  // First, try to find Gmail quote divs and extract content before them
  const gmailQuoteMatch = content.match(/([\s\S]*?)<div class="gmail_quote"/i);
  if (gmailQuoteMatch) {
    content = gmailQuoteMatch[1];
  } else {
    // Look for other quote indicators
    const quotePatterns = [
      /<blockquote[\s\S]*?>/i,
      /<div[^>]*class="[^"]*quote[^"]*"/i,
      /On .{1,100} wrote:/i
    ];
    
    for (const pattern of quotePatterns) {
      const match = content.match(new RegExp(`([\s\S]*?)${pattern.source}`, pattern.flags));
      if (match) {
        content = match[1];
        break;
      }
    }
  }
  
  // Clean up the content more thoroughly
  content = content
    .replace(/<div[^>]*class="gmail_attr"[^>]*>[\s\S]*?<\/div>/gi, '') // Remove Gmail attribution
    .replace(/^\s*<div[^>]*>\s*$|^\s*<\/div>\s*$/gm, '') // Remove empty divs
    .replace(/<br\s*\/?\s*>$/gi, '') // Remove trailing breaks
    .replace(/^<div[^>]*>|<\/div>$/gi, '') // Remove wrapping div if it's the only one
    .trim();
  
  return content;
}

function extractQuotedContent(htmlBody: string) {
  // Extract Gmail quote container content
  const gmailQuoteMatch = htmlBody.match(/<div class="gmail_quote"[^>]*>([\s\S]*?)<\/div>(?:\s*<\/div>)?$/i);
  if (gmailQuoteMatch) {
    return gmailQuoteMatch[1];
  }
  
  // Try to match the full gmail_quote structure with nested content
  const fullQuoteMatch = htmlBody.match(/<div class="gmail_quote"[^>]*>([\s\S]*?)$/i);
  if (fullQuoteMatch) {
    return fullQuoteMatch[1];
  }
  
  // Extract blockquote content
  const blockquoteMatch = htmlBody.match(/<blockquote[^>]*class="[^"]*gmail_quote[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (blockquoteMatch) {
    return blockquoteMatch[1];
  }
  
  // Extract content after "On ... wrote:" pattern
  const onWroteMatch = htmlBody.match(/On .{1,100} wrote:([\s\S]*)/i);
  if (onWroteMatch) {
    return onWroteMatch[1];
  }
  
  return null;
}

function cleanHTML(html: string) {
  // Remove excessive whitespace and normalize
  let cleaned = html
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*<div[^>]*>\s*$|^\s*<\/div>\s*$/gm, '') // Remove empty divs
    .replace(/(<br\s*\/?>[\s\n]*){3,}/gi, '<br><br>') // Limit consecutive breaks
    .trim();
  
  // Clean up Gmail-specific classes and styles while preserving basic structure
  cleaned = cleaned
    .replace(/class="gmail_[^"]*"/gi, '') // Remove gmail_ classes
    .replace(/style="[^"]*"/gi, '') // Remove inline styles
    .replace(/<div[^>]*>/gi, '<div>') // Clean div attributes
    .replace(/<span[^>]*>/gi, '<span>') // Clean span attributes
    .replace(/dir="[^"]*"/gi, '') // Remove dir attributes
    .replace(/\s+>/g, '>') // Clean up extra spaces before closing brackets
    .replace(/<div>\s*<\/div>/gi, '') // Remove empty divs
    .replace(/<span>\s*<\/span>/gi, ''); // Remove empty spans
  
  return cleaned;
}

// Add a function to sanitize HTML for safe rendering
export function sanitizeHTML(html: string) {
  // Basic HTML sanitization - remove potentially dangerous elements
  let sanitized = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: URLs
  
  // Clean Gmail-specific attributes and classes that might interfere with styling
  sanitized = sanitized
    .replace(/class="gmail_[^"]*"/gi, '') // Remove Gmail classes
    .replace(/style="[^"]*"/gi, '') // Remove inline styles that might conflict
    .replace(/dir="[^"]*"/gi, '') // Remove direction attributes
    .replace(/\s+>/g, '>') // Clean up spaces before closing brackets
    .replace(/<div>\s*<\/div>/gi, '') // Remove empty divs
    .replace(/<span>\s*<\/span>/gi, ''); // Remove empty spans
  
  return sanitized;
}

export function formatSenderName(from: string) {
  // Clean up the input string
  let cleanFrom = from.trim();
  
  // Handle quoted names like '"John Doe" <john@example.com>'
  const quotedMatch = cleanFrom.match(/^"([^"]+)"\s*<(.+)>$/);
  if (quotedMatch) {
    const [, name, email] = quotedMatch;
    return {
      name: name.trim(),
      email: email.trim(),
      displayName: name.trim()
    };
  }
  
  // Handle standard format like 'John Doe <john@example.com>'
  const standardMatch = cleanFrom.match(/^(.*?)\s*<(.+)>$/);
  if (standardMatch) {
    const [, name, email] = standardMatch;
    const cleanName = name.trim();
    return {
      name: cleanName || email.trim(),
      email: email.trim(),
      displayName: cleanName || email.trim().split('@')[0]
    };
  }
  
  // Handle name-only format (no email in brackets)
  if (!cleanFrom.includes('@')) {
    return {
      name: cleanFrom,
      email: cleanFrom,
      displayName: cleanFrom
    };
  }
  
  // Just an email address
  return {
    name: cleanFrom,
    email: cleanFrom,
    displayName: cleanFrom.split('@')[0]
  };
}

export function formatEmailDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const emailDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (emailDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (emailDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else if (now.getFullYear() === date.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

export function cleanHtmlEntities(text: string) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...');
}
