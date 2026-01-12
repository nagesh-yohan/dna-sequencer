document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dnaInput = document.getElementById('dnaInput');
    const proteinOutput = document.getElementById('proteinOutput');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const copyBtn = document.getElementById('copyBtn');
    const charCount = document.getElementById('charCount');
    const validationStatus = document.getElementById('validationStatus');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    // Standard Genetic Code
    const codonTable = {
        'ATA': 'I', 'ATC': 'I', 'ATT': 'I', 'ATG': 'M',
        'ACA': 'T', 'ACC': 'T', 'ACG': 'T', 'ACT': 'T',
        'AAC': 'N', 'AAT': 'N', 'AAA': 'K', 'AAG': 'K',
        'AGC': 'S', 'AGT': 'S', 'AGA': 'R', 'AGG': 'R',
        'CTA': 'L', 'CTC': 'L', 'CTG': 'L', 'CTT': 'L',
        'CCA': 'P', 'CCC': 'P', 'CCG': 'P', 'CCT': 'P',
        'CAC': 'H', 'CAT': 'H', 'CAA': 'Q', 'CAG': 'Q',
        'CGA': 'R', 'CGC': 'R', 'CGG': 'R', 'CGT': 'R',
        'GTA': 'V', 'GTC': 'V', 'GTG': 'V', 'GTT': 'V',
        'GCA': 'A', 'GCC': 'A', 'GCG': 'A', 'GCT': 'A',
        'GAC': 'D', 'GAT': 'D', 'GAA': 'E', 'GAG': 'E',
        'GGA': 'G', 'GGC': 'G', 'GGG': 'G', 'GGT': 'G',
        'TCA': 'S', 'TCC': 'S', 'TCG': 'S', 'TCT': 'S',
        'TTC': 'F', 'TTT': 'F', 'TTA': 'L', 'TTG': 'L',
        'TAC': 'Y', 'TAT': 'Y', 'TAA': '_', 'TAG': '_',
        'TGC': 'C', 'TGT': 'C', 'TGA': '_', 'TGG': 'W',
    };

    /**
     * Updates the character count and validation status UI.
     */
    function updateInputStats() {
        const value = dnaInput.value;
        const cleanValue = value.replace(/\s/g, '').toUpperCase();
        charCount.innerText = `${cleanValue.length} nucleotides`;

        // Check for invalid characters
        const invalidChars = cleanValue.replace(/[ATCG]/g, '');

        if (value.trim() === '') {
            validationStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Ready';
            validationStatus.className = 'status-valid';
        } else if (invalidChars.length > 0) {
            validationStatus.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Invalid DNA Characters';
            validationStatus.className = 'status-error';
        } else if (cleanValue.length % 3 !== 0) {
            validationStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Partial Codon (Not multiple of 3)';
            validationStatus.className = 'status-error'; // Warning really, but using error style for visibility
        } else {
            validationStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Valid Sequence';
            validationStatus.className = 'status-valid';
        }
    }

    /**
     * Converts DNA sequence to Protein sequence.
     */
    function translateDNA() {
        const dna = dnaInput.value.replace(/\s/g, '').toUpperCase();

        if (!dna) {
            showToast('Please enter a DNA sequence first.', true);
            return;
        }

        // Validate first
        const invalidChars = dna.replace(/[ATCG]/g, '');
        if (invalidChars.length > 0) {
            showToast(`Error: Invalid characters found: "${invalidChars.substring(0, 5)}..."`, true);
            return;
        }

        let protein = '';
        for (let i = 0; i < dna.length; i += 3) {
            const codon = dna.substring(i, i + 3);
            if (codon.length === 3) {
                const aminoAcid = codonTable[codon] || '?';

                // Optional: Stop at stop codon?
                // For this tool, we will represent Stop as a generic symbol like '*' or just not include it inside the chain?
                // The prompt asked for "protein template". Usually '_' or '*' denotes stop.
                // We will print the value.
                if (aminoAcid === '_') {
                    protein += '*'; // Represent stop as *
                } else {
                    protein += aminoAcid;
                }
            }
        }

        proteinOutput.value = protein;
        // Animation effect for output
        proteinOutput.style.opacity = '0.5';
        setTimeout(() => proteinOutput.style.opacity = '1', 200);
    }

    /**
     * Displays a toast notification.
     */
    function showToast(message, isError = false) {
        toastMsg.innerText = message;
        toast.className = `toast show`;
        toast.querySelector('i').className = isError ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-check';
        toast.style.borderColor = isError ? 'var(--error)' : 'var(--success)';
        toast.style.color = isError ? 'var(--error)' : 'var(--success)';

        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
            toast.classList.add('hidden');
        }, 3000);
    }

    // Event Listeners
    dnaInput.addEventListener('input', updateInputStats);

    convertBtn.addEventListener('click', translateDNA);

    clearBtn.addEventListener('click', () => {
        dnaInput.value = '';
        proteinOutput.value = '';
        updateInputStats();
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            dnaInput.value = text;
            updateInputStats();
            showToast('Pasted from clipboard!');
        } catch (err) {
            showToast('Failed to paste.', true);
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!proteinOutput.value) return;

        navigator.clipboard.writeText(proteinOutput.value).then(() => {
            showToast('Protein sequence copied!');
        }).catch(() => {
            showToast('Failed to copy.', true);
        });
    });
});
