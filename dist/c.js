document.addEventListener('DOMContentLoaded', () => {
    const sintasq = window.sintasq_initializer('#stroot')

    sintasq.register.vendor('true1ann')

    sintasq.register.directory('true1ann:tc') // Test component container
    sintasq.register.method('true1ann:tc', { 
        name: 'api', 
        method: () => {
        return { success: true }
        }
    })

    sintasq.register.component('true1ann:tc', {
        name: 'main',
        template: `
            <span>lets fucking go!</span>
        `,
        lifeHooks: {
            afterCreate: (stlc) => {
                const res = sintasq.access.method('true1ann:tc/api').method()
                console.log(res)
            }
        }
    })
})

