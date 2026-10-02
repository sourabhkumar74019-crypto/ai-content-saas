document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const userPrompt = document.getElementById('user-prompt');
    const toolType = document.getElementById('tool-type');
    const toneType = document.getElementById('tone-type');
    const outputBox = document.getElementById('output-box');
    const copyBtn = document.getElementById('copy-btn');
    const creditCount = document.getElementById('credit-count');
    const creditProgress = document.getElementById('credit-progress');
    const pricingModal = document.getElementById('pricing-modal');
    const closeModal = document.getElementById('close-modal');

    // Initial Credit State
    let totalCredits = 5;
    let remainingCredits = 5;

    // Open Modal Click (Event Listener for ALL upgrade buttons)
    document.addEventListener('click', (e) => {
        if (e.target && (e.target.classList.contains('upgrade-btn') || e.target.closest('.upgrade-btn'))) {
            if (pricingModal) pricingModal.style.display = 'flex';
        }
    });

    // Close Modal Click
    if (closeModal && pricingModal) {
        closeModal.addEventListener('click', () => {
            pricingModal.style.display = 'none';
        });
    }

    // Close Modal outside click
    window.addEventListener('click', (e) => {
        if (e.target === pricingModal) pricingModal.style.display = 'none';
    });

    // Generate Button Click Event
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const promptText = userPrompt.value.trim();

            if (!promptText) {
                alert('Please enter a topic or description first!');
                return;
            }

            if (remainingCredits <= 0) {
                alert('You have used all your free credits! Please upgrade to Pro.');
                if (pricingModal) pricingModal.style.display = 'flex';
                return;
            }

            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating AI Response...';
            outputBox.innerHTML = '<p class="placeholder-text">AI is crafting your content, please wait...</p>';

            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tool: toolType.value,
                        prompt: promptText,
                        tone: toneType.value
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    remainingCredits--;
                    updateCreditUI();
                    outputBox.innerText = data.result;
                } else {
                    outputBox.innerHTML = `<p style="color: #ef4444;">Error: ${data.error || 'Something went wrong'}</p>`;
                }
            } catch (err) {
                outputBox.innerHTML = '<p style="color: #ef4444;">Server connecting... Please try again in a few seconds.</p>';
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate Content';
            }
        });
    }

    // Copy to Clipboard
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = outputBox.innerText;
            if (!textToCopy || outputBox.querySelector('.placeholder-text')) {
                alert('Nothing to copy yet!');
                return;
            }
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                setTimeout(() => { copyBtn.innerHTML = originalHTML; }, 2000);
            });
        });
    }

    // Helper: Update Credits UI
    function updateCreditUI() {
        if (creditCount) creditCount.textContent = `${remainingCredits} / ${totalCredits}`;
        if (creditProgress) {
            const percentage = (remainingCredits / totalCredits) * 100;
            creditProgress.style.width = `${percentage}%`;
        }
    }
});
