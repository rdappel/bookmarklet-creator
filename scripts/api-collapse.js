// API Collapse

const iframe = document.querySelector('iframe')
const iframeDocument = iframe ? iframe.contentDocument || iframe.contentWindow.document : document
iframeDocument.querySelectorAll('.expand-operation').forEach(button => {
	const expanded = button.getAttribute('aria-expanded')
	if (expanded === 'true') button.click()
})
