import { Artwork } from '@/types'
import { wrapHtml, styles } from './layout'

export const getDeliveryConfirmationTemplate = (clientName: string, address: string, deliveredItems: Artwork[]) => {
  const content = `
    <p style="${styles.text}">Dear ${clientName},</p>
    <p style="${styles.text}">Herewith is a receipt to confirm that we have delivered the following items:</p>
    
    <ul style="${styles.list}">
      ${deliveredItems.map(a => `
        <li style="${styles.listItem}">
          <span style="color: #333; font-weight: 600;">${a.artist || 'Unknown Artist'}</span> 
          <br/>
          <span style="color: #555;">${a.title || 'Untitled'}</span>
        </li>
      `).join('')}
    </ul>
    
    <p style="${styles.text} margin-top: 30px;">
      Thank you so much,<br/>
      <strong>Everard Read</strong>
    </p>
  `;
  
  return wrapHtml('Delivery Confirmation', content);
}
