// Base styles consistent with app branding
const styles = {
  body: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f5f5f5;
    color: #1a1a1a;
    margin: 0;
    padding: 0;
    line-height: 1.6;
  `,
  container: `
    width: 100%;
    max-width: 600px;
    margin: 30px auto;
    background-color: #ffffff;
    padding: 32px;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  `,
  header: `
    margin-bottom: 24px;
    text-align: center;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 20px;
  `,
  h1: `
    color: #1a1a1a;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.025em;
  `,
  h2: `
    color: #404040;
    font-size: 18px;
    font-weight: 600;
    margin-top: 24px;
    margin-bottom: 12px;
  `,
  text: `
    color: #4a4a4a;
    font-size: 16px;
    margin-bottom: 16px;
  `,
  list: `
    list-style: none;
    padding: 0;
    margin: 16px 0;
  `,
  listItem: `
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 15px;
  `,
  footer: `
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
    text-align: center;
    color: #888;
    font-size: 14px;
  `,
  button: `
    display: inline-block;
    padding: 12px 24px;
    margin: 20px 0;
    background-color: #000000;
    color: #ffffff;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    text-align: center;
  `
};

export const wrapHtml = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="${styles.body}">
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.h1}">${title}</h1>
      </div>
      
      ${content}
      
      <div style="${styles.footer}">
        <p style="margin: 0;">© ${new Date().getFullYear()} ArtTrack Delivery. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

export { styles };

