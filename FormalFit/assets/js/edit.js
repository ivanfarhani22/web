document.addEventListener('DOMContentLoaded', function() {
    // === Elements ===
    const imageUploadBox = document.getElementById('imageUploadBox');
    const fileInput = document.getElementById('fileInput');
    const frameFileInput = document.getElementById('frameFileInput'); // New frame upload input
    const placeholderContent = document.getElementById('placeholderContent');
    const downloadButton = document.getElementById('downloadButton');
    const outerTypeDropdown = document.getElementById('outerTypeDropdown');
    const dropdownText = outerTypeDropdown.querySelector('.dropdown-text');
    const dropdownOptions = outerTypeDropdown.querySelector('.dropdown-options');
    const uploadFrameButton = document.getElementById('uploadFrameButton'); // New button for frame upload
    const aspectRatioDropdown = document.getElementById('aspectRatioDropdown'); // Dropdown untuk skala

    // === State variables ===
    let userImage = null;
    let outerFrame = null;
    let customFrameUploaded = false; // Flag to track if a custom frame was uploaded
    let customFrameImage = null; // To store the custom frame image
    let frameImages = {}; // Cache for preloaded frame images
    let imageState = {
        verticalPosition: 50,
        horizontalPosition: 50,
        zoom: 50,
        outerType: 'none',
        outerVerticalPosition: 50,
        outerHorizontalPosition: 50,
        outerZoom: 50,
        imageAspectRatio: '1/1'  // Default aspect ratio 1:1 (format: 1/1 atau 3/4)
    };

    // === Frame data for demo ===
    const frames = {
        frame1: { src: 'assets/images/Jas 11.png', name: 'Jas 1' },
        frame2: { src: 'assets/images/Jas 13.png', name: 'Jas 2' },
        frame3: { src: 'assets/images/Model Jas 6.png', name: 'Jas 3' },
        frame4: { src: 'assets/images/Model Jas 29.png', name: 'Jas 4' }
    };

    // === Upload frame (custom) ===
    if (uploadFrameButton) {
        uploadFrameButton.addEventListener('click', function() {
            if (frameFileInput) {
                frameFileInput.click();
            }
        });
    }
    if (frameFileInput) {
        frameFileInput.addEventListener('change', function(e) {
            handleFrameUpload(e.target.files[0]);
        });
    }
    function handleFrameUpload(file) {
        if (!file || !file.type.match('image.*')) {
            alert('Silakan pilih file gambar yang valid untuk frame!');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            customFrameUploaded = true;
            customFrameImage = new Image();
            customFrameImage.crossOrigin = 'Anonymous';
            customFrameImage.src = e.target.result;
            if (dropdownText) {
                dropdownText.textContent = 'Frame Kustom';
            }
            imageState.outerType = 'custom';
            updateOuterFrame();
            updateImageDisplay();
        };
        reader.readAsDataURL(file);
    }

    // === Preload frame images ===
    function preloadFrames() {
        Object.keys(frames).forEach(key => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            const basePath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            img.src = basePath + frames[key].src;
            frameImages[key] = img;
            img.onload = function() {
                console.log(`Preloaded frame: ${key} - ${this.src}`);
            };
            img.onerror = function() {
                console.error(`Failed to preload frame: ${key}`, this.src);
            };
        });
    }
    preloadFrames();

    // === File upload handling (click & drag-drop) ===
    imageUploadBox.addEventListener('click', function() {
        fileInput.click();
    });
    fileInput.addEventListener('change', function(e) {
        handleFileUpload(e.target.files[0]);
    });
    imageUploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        imageUploadBox.classList.add('dragging');
    });
    imageUploadBox.addEventListener('dragleave', function() {
        imageUploadBox.classList.remove('dragging');
    });
    imageUploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        imageUploadBox.classList.remove('dragging');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    function handleFileUpload(file) {
        if (!file || !file.type.match('image.*')) {
            alert('Silakan pilih file gambar yang valid!');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            placeholderContent.style.display = 'none';
            if (userImage) {
                // Hapus userImage jika benar-benar merupakan child dari imageUploadBox
                if (userImage.parentNode === imageUploadBox) {
                    imageUploadBox.removeChild(userImage);
                }
            }
            // Create and add new user image element
            userImage = document.createElement('img');
            userImage.className = 'user-image';
            userImage.src = e.target.result;
            imageUploadBox.appendChild(userImage);
            updateOuterFrame();
            updateImageDisplay();
        };
        reader.readAsDataURL(file);
    }

    // === Dropdown handling for Outer Frame (predefined) ===
    if (outerTypeDropdown) {
        outerTypeDropdown.addEventListener('click', function(e) {
            dropdownOptions.classList.toggle('show');
            e.stopPropagation();
        });
        document.addEventListener('click', function(e) {
            if (!outerTypeDropdown.contains(e.target)) {
                dropdownOptions.classList.remove('show');
            }
        });
        const dropdownOptionElements = document.querySelectorAll('.dropdown-option');
        dropdownOptionElements.forEach(option => {
            option.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                dropdownText.textContent = this.textContent;
                imageState.outerType = value;
                if (value !== 'custom') {
                    customFrameUploaded = false;
                }
                updateOuterFrame();
                updateImageDisplay();
            });
        });
    }

    // === Dropdown handling for Aspect Ratio (Skala Gambar) ===
    if (aspectRatioDropdown) {
        const aspectDropdownText = aspectRatioDropdown.querySelector('.dropdown-text');
        const aspectDropdownOptions = aspectRatioDropdown.querySelector('.dropdown-options');
        aspectRatioDropdown.addEventListener('click', function(e) {
            aspectDropdownOptions.classList.toggle('show');
            e.stopPropagation();
        });
        document.addEventListener('click', function(e) {
            if (!aspectRatioDropdown.contains(e.target)) {
                aspectDropdownOptions.classList.remove('show');
            }
        });
        const aspectOptions = aspectDropdownOptions.querySelectorAll('.dropdown-option');
        aspectOptions.forEach(option => {
            option.addEventListener('click', function() {
                const ratioValue = this.getAttribute('data-value'); // Expected "3:4" or "1:1"
                aspectDropdownText.textContent = this.textContent;
                // Convert "3:4" to "3/4" to match proper CSS syntax for aspect-ratio.
                imageState.imageAspectRatio = ratioValue.replace(':', '/');
                updateImageDisplay();
            });
        });
    }

    // === Function to update outer frame ===
    function updateOuterFrame() {
        // Hanya menghapus outerFrame jika benar-benar merupakan child dari imageUploadBox
        if (outerFrame && outerFrame.parentNode === imageUploadBox) {
            imageUploadBox.removeChild(outerFrame);
            outerFrame = null;
        }
        if (imageState.outerType === 'none' || !userImage) {
            return;
        }
        outerFrame = document.createElement('img');
        outerFrame.className = 'outer-frame';
        if (customFrameUploaded && imageState.outerType === 'custom') {
            if (customFrameImage) {
                outerFrame.src = customFrameImage.src;
                console.log("Using custom uploaded frame for display");
            } else {
                console.error("Custom frame not found");
                return;
            }
        } else {
            if (!frames[imageState.outerType]) {
                console.error("Frame not found:", imageState.outerType);
                return;
            }
            if (frameImages[imageState.outerType] && frameImages[imageState.outerType].complete) {
                outerFrame.src = frameImages[imageState.outerType].src;
                console.log("Using preloaded frame for display:", imageState.outerType);
            } else {
                const basePath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
                outerFrame.src = basePath + frames[imageState.outerType].src;
                console.log("Loading frame for display:", basePath + frames[imageState.outerType].src);
            }
        }
        imageUploadBox.appendChild(outerFrame);
        outerFrame.onload = function() {
            console.log("Frame loaded for display:", imageState.outerType);
        };
        outerFrame.onerror = function() {
            console.error("Failed to load frame for display:", imageState.outerType);
        };
    }

    // === Function to update image display based on state ===
    function updateImageDisplay() {
        if (!userImage) return;
        // Apply transformations to the user image
        const xPos = (imageState.horizontalPosition - 50) / 50 * 100;
        const yPos = (imageState.verticalPosition - 50) / 50 * 100;
        const scale = 0.5 + (imageState.zoom / 100);
        userImage.style.transform = `translate(${xPos}%, ${yPos}%) scale(${scale})`;
        // Apply aspect ratio (scale) settings
        if (imageState.imageAspectRatio) {
            userImage.style.objectFit = "cover";
            userImage.style.aspectRatio = imageState.imageAspectRatio;
        }
        // Update outer frame transformation if exists
        if (outerFrame) {
            const frameXPos = (imageState.outerHorizontalPosition - 50) / 50 * 100;
            const frameYPos = (imageState.outerVerticalPosition - 50) / 50 * 100;
            const frameScale = 0.5 + (imageState.outerZoom / 100);
            outerFrame.style.transform = `translate(${frameXPos}%, ${frameYPos}%) scale(${frameScale})`;
            outerFrame.style.zIndex = "100";
            outerFrame.style.opacity = "1";
        }
    }

    // === Download functionality ===
    downloadButton.addEventListener('click', function() {
        if (!userImage) {
            alert('Anda harus mengupload gambar terlebih dahulu!');
            return;
        }
        html2canvas(imageUploadBox).then(canvas => {
            try {
                const dataURL = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'edited-image-' + new Date().getTime() + '.png';
                link.href = dataURL;
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(dataURL);
                }, 100);
            } catch (e) {
                console.error("Download gagal:", e);
                alert('Gagal mendownload gambar. Silakan coba lagi.');
            }
        }).catch(error => {
            console.error("html2canvas error:", error);
            alert('Gagal menangkap tampilan. Silakan coba lagi.');
        });
    });
    
    
    // === Initialize slider controls ===
    function initializeSliders() {
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            const control = slider.getAttribute('data-control');
            const handle = slider.querySelector('.slider-handle');
            const fill = slider.querySelector('.slider-fill');
            updateSliderUI(slider, imageState[control]);
            handle.addEventListener('mousedown', function(e) {
                e.preventDefault();
                const sliderRect = slider.getBoundingClientRect();
                const sliderWidth = sliderRect.width;
                function handleMouseMove(e) {
                    const relativeX = Math.max(0, Math.min(e.clientX - sliderRect.left, sliderWidth));
                    const value = Math.round((relativeX / sliderWidth) * 100);
                    imageState[control] = value;
                    updateSliderUI(slider, value);
                    updateImageDisplay();
                }
                function handleMouseUp() {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                }
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });
            slider.addEventListener('click', function(e) {
                if (e.target === handle) return;
                const sliderRect = slider.getBoundingClientRect();
                const relativeX = e.clientX - sliderRect.left;
                const value = Math.round((relativeX / sliderRect.width) * 100);
                imageState[control] = value;
                updateSliderUI(slider, value);
                updateImageDisplay();
            });
            const decreaseArrow = slider.parentElement.querySelector('.decrease');
            const increaseArrow = slider.parentElement.querySelector('.increase');
            if (decreaseArrow) {
                decreaseArrow.addEventListener('click', function() {
                    const value = Math.max(0, imageState[control] - 5);
                    imageState[control] = value;
                    updateSliderUI(slider, value);
                    updateImageDisplay();
                });
            }
            if (increaseArrow) {
                increaseArrow.addEventListener('click', function() {
                    const value = Math.min(100, imageState[control] + 5);
                    imageState[control] = value;
                    updateSliderUI(slider, value);
                    updateImageDisplay();
                });
            }
        });
    }
    function updateSliderUI(slider, value) {
        const handle = slider.querySelector('.slider-handle');
        const fill = slider.querySelector('.slider-fill');
        handle.style.left = `${value}%`;
        fill.style.width = `${value}%`;
    }
    initializeSliders();

    // === Mark active nav link ===
    let links = document.querySelectorAll("a");
    links.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add("active");
        }
    });

    // (Optional) Function to test frame image accessibility
    function testFrameImages() {
        console.log("Testing frame image accessibility...");
        Object.keys(frames).forEach(key => {
            const basePath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            const frameSrc = basePath + frames[key].src;
            fetch(frameSrc)
                .then(response => {
                    if (response.ok) {
                        console.log(`Frame ${key} is accessible`);
                    } else {
                        console.error(`Frame ${key} returned status: ${response.status}`);
                    }
                })
                .catch(error => {
                    console.error(`Error fetching frame ${key}:`, error);
                });
        });
    }
    setTimeout(testFrameImages, 1000);
});

document.addEventListener("DOMContentLoaded", function() {
    let links = document.querySelectorAll("a");
    links.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add("active");
        }
    });
});
