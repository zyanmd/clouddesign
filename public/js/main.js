document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const fileTabBtn = document.getElementById('fileTabBtn');
    const textTabBtn = document.getElementById('textTabBtn');
    const fileTab = document.getElementById('fileTab');
    const textTab = document.getElementById('textTab');

    fileTabBtn.addEventListener('click', () => {
        fileTab.classList.remove('hidden');
        textTab.classList.add('hidden');
        fileTabBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        fileTabBtn.classList.remove('text-gray-500');
        textTabBtn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        textTabBtn.classList.add('text-gray-500');
    });

    textTabBtn.addEventListener('click', () => {
        fileTab.classList.add('hidden');
        textTab.classList.remove('hidden');
        textTabBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        textTabBtn.classList.remove('text-gray-500');
        fileTabBtn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        fileTabBtn.classList.add('text-gray-500');
    });

    // File upload handling
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const removeFile = document.getElementById('removeFile');
    const fileUploadForm = document.getElementById('fileUploadForm');

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('border-blue-500', 'bg-blue-50');
    }

    function unhighlight() {
        dropArea.classList.remove('border-blue-500', 'bg-blue-50');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            fileInput.files = files;
            updateFilePreview();
        }
    }

    fileInput.addEventListener('change', updateFilePreview);

    function updateFilePreview() {
        if (fileInput.files.length) {
            const file = fileInput.files[0];
            fileName.textContent = file.name;
            filePreview.classList.remove('hidden');
        } else {
            filePreview.classList.add('hidden');
        }
    }

    removeFile.addEventListener('click', () => {
        fileInput.value = '';
        filePreview.classList.add('hidden');
    });

    // Form submissions
    const textUploadForm = document.getElementById('textUploadForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultSection = document.getElementById('resultSection');
    const errorSection = document.getElementById('errorSection');

    fileUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!fileInput.files.length) {
            showError('Please select a file to upload');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        await uploadContent(formData);
    });

    textUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('textInput');
        if (!textInput.value.trim()) {
            showError('Please enter some text to upload');
            return;
        }
        
        const formData = new FormData();
        formData.append('text', textInput.value);
        
        await uploadContent(formData);
    });

    async function uploadContent(formData) {
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                displayResult(data);
            } else {
                showError(data.message || 'Upload failed');
            }
        } catch (error) {
            showError('An error occurred during upload');
            console.error(error);
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }

    function displayResult(data) {
        const result = data.result;
        
        document.getElementById('result-filename').textContent = result.filename;
        document.getElementById('result-size').textContent = result.size;
        document.getElementById('result-type').textContent = result.type;
        
        const urlInput = document.getElementById('result-url');
        urlInput.value = result.url;
        
        const infoLink = document.getElementById('result-info');
        infoLink.href = data.information || 'https://cloudkuimages.com/ch';
        
        resultSection.classList.remove('hidden');
        
        // Reset forms
        fileInput.value = '';
        filePreview.classList.add('hidden');
        document.getElementById('textInput').value = '';
    }

    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        errorSection.classList.remove('hidden');
    }

    // Copy URL button
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    copyUrlBtn.addEventListener('click', () => {
        const urlInput = document.getElementById('result-url');
        urlInput.select();
        document.execCommand('copy');
        
        // Show copied tooltip
        const originalText = copyUrlBtn.innerHTML;
        copyUrlBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyUrlBtn.innerHTML = originalText;
        }, 2000);
    });
});
