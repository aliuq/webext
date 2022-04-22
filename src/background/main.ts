import { sendMessage } from 'webext-bridge'

browser.runtime.onConnect.addListener(async() => {
  const tab = await browser.tabs.query({ active: true, currentWindow: true })
  sendMessage('ping', {}, { context: 'content-script', tabId: tab[0].id as number })
})
