// Alignment (Goal) Helper

const b = document.querySelector('iframe')
const d = b ? (b.contentDocument || b.contentWindow.document) : document

;[ '10-152-1', '10-152-114' ].forEach(courseId => {
    console.log(`Expanding ${courseId}`)
    const checkbox = d.querySelector(`input[type="checkbox"][id*="${courseId}"]`)
    const event = new Event('click', { bubbles: true })
    checkbox.dispatchEvent(event)
})
