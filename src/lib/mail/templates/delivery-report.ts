import { Artwork } from '@/types'
import { wrapHtml, styles } from './layout'

export const getDeliveryReportTemplate = (clientName: string, address: string, deliveredItems: Artwork[], returnedItems: Artwork[]) => {
  const content = `
    <div style="margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px;">
      <p style="margin: 5px 0; color: #666; font-size: 14px;">CLIENT</p>
      <p style="${styles.text} margin: 0; font-weight: 600;">${clientName}</p>
      <p style="margin: 15px 0 5px 0; color: #666; font-size: 14px;">ADDRESS</p>
      <p style="${styles.text} margin: 0; font-weight: 600;">${address}</p>
    </div>
    
    <h2 style="${styles.h2}">Delivered Items</h2>
    <ul style="${styles.list}">
      ${deliveredItems.length > 0 ? deliveredItems.map(a => `
        <li style="${styles.listItem}">
          <div style="display: flex; justify-content: space-between;">
            <strong>${a.wac_code}</strong>
          </div>
          <div style="color: #666;">${a.title}</div>
        </li>
      `).join('') : '<li style="padding: 10px; color: #888; font-style: italic;">No items delivered</li>'}
    </ul>
    
    <h2 style="${styles.h2}">Returned / Not Delivered</h2>
    <ul style="${styles.list}">
      ${returnedItems.length > 0 ? returnedItems.map(a => `
        <li style="${styles.listItem} border-left: 3px solid #ef4444; padding-left: 15px;">
          <strong>${a.wac_code}</strong> - <span style="color: #ef4444; font-weight: 600; text-transform: uppercase; font-size: 12px;">${a.status.replace('_', ' ')}</span>
          <div style="color: #666;">${a.title}</div>
        </li>
      `).join('') : '<li style="padding: 10px; color: #888; font-style: italic;">No items returned</li>'}
    </ul>
  `;

  return wrapHtml('Delivery Report', content);
}
