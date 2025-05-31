/**
 * Enhanced Image Editor with Frame Overlay
 * Optimized for better maintainability and performance
 */

class ImageEditor {
    constructor() {
        // DOM Elements
        this.elements = {
            imageUploadBox: document.getElementById('imageUploadBox'),
            fileInput: document.getElementById('fileInput'),
            frameFileInput: document.getElementById('frameFileInput'),
            placeholderContent: document.getElementById('placeholderContent'),
            downloadButton: document.getElementById('downloadButton'),
            outerTypeDropdown: document.getElementById('outerTypeDropdown'),
            uploadFrameButton: document.getElementById('uploadFrameButton'),
            aspectRatioDropdown: document.getElementById('aspectRatioDropdown')
        };

        // State management
        this.state = {
            userImage: null,
            outerFrame: null,
            customFrameImage: null,
            customFrameUploaded: false,
            frameImages: {},
            frameDataUrls: {},
            imageState: {
                verticalPosition: 50,
                horizontalPosition: 50,
                zoom: 50,
                outerType: 'none',
                outerVerticalPosition: 50,
                outerHorizontalPosition: 50,
                outerZoom: 50,
                imageAspectRatio: '1/1'
            }
        };

        // Configuration
        this.config = {
            frames: {
                frame1: { src: 'assets/images/Jas 11.png', name: 'Jas 1' },
                frame2: { src: 'assets/images/Jas 13.png', name: 'Jas 2' },
                frame3: { src: 'assets/images/Model Jas 6.png', name: 'Jas 3' },
                frame4: { src: 'assets/images/Model Jas 29.png', name: 'Jas 4' }
            },
            aspectRatios: {
                '1:1': { width: 400, height: 400 },
                '3:4': { width: 300, height: 400 },
                '4:3': { width: 400, height: 300 }
            },
            baseWidth: 400
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            await this.preloadFrames();
            this.bindEvents();
            this.initializeSliders();
            this.markActiveNavLink();
            
            // Delayed frame accessibility test
            setTimeout(() => this.testFrameImages(), 1000);
            console.log('Image Editor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Image Editor:', error);
        }
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Image upload events
        this.bindImageUploadEvents();
        
        // Frame upload events
        this.bindFrameUploadEvents();
        
        // Dropdown events
        this.bindDropdownEvents();
        
        // Download event
        this.bindDownloadEvent();
        
        // Global click handler for dropdowns
        document.addEventListener('click', (e) => this.handleGlobalClick(e));
    }

    /**
     * Bind image upload related events
     */
    bindImageUploadEvents() {
        const { imageUploadBox, fileInput } = this.elements;
        
        if (!imageUploadBox || !fileInput) return;

        imageUploadBox.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));
        
        // Drag and drop
        imageUploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadBox.classList.add('dragging');
        });
        
        imageUploadBox.addEventListener('dragleave', () => {
            imageUploadBox.classList.remove('dragging');
        });
        
        imageUploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadBox.classList.remove('dragging');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }

    /**
     * Bind frame upload related events
     */
    bindFrameUploadEvents() {
        const { uploadFrameButton, frameFileInput } = this.elements;
        
        if (uploadFrameButton) {
            uploadFrameButton.addEventListener('click', () => {
                if (frameFileInput) frameFileInput.click();
            });
        }
        
        if (frameFileInput) {
            frameFileInput.addEventListener('change', (e) => {
                this.handleFrameUpload(e.target.files[0]);
            });
        }
    }

    /**
     * Bind dropdown events
     */
    bindDropdownEvents() {
        this.bindOuterFrameDropdown();
        this.bindAspectRatioDropdown();
    }

    /**
     * Bind outer frame dropdown events
     */
    bindOuterFrameDropdown() {
        const { outerTypeDropdown } = this.elements;
        if (!outerTypeDropdown) return;

        const dropdownText = outerTypeDropdown.querySelector('.dropdown-text');
        const dropdownOptions = outerTypeDropdown.querySelector('.dropdown-options');
        
        outerTypeDropdown.addEventListener('click', (e) => {
            dropdownOptions.classList.toggle('show');
            e.stopPropagation();
        });

        const options = outerTypeDropdown.querySelectorAll('.dropdown-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                dropdownText.textContent = option.textContent;
                this.state.imageState.outerType = value;
                
                if (value !== 'custom') {
                    this.state.customFrameUploaded = false;
                }
                
                this.updateOuterFrame();
                this.updateImageDisplay();
            });
        });
    }

    /**
     * Bind aspect ratio dropdown events
     */
    bindAspectRatioDropdown() {
        const { aspectRatioDropdown } = this.elements;
        if (!aspectRatioDropdown) return;

        const dropdownText = aspectRatioDropdown.querySelector('.dropdown-text');
        const dropdownOptions = aspectRatioDropdown.querySelector('.dropdown-options');
        
        aspectRatioDropdown.addEventListener('click', (e) => {
            dropdownOptions.classList.toggle('show');
            e.stopPropagation();
        });

        const options = dropdownOptions.querySelectorAll('.dropdown-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const ratioValue = option.getAttribute('data-value');
                dropdownText.textContent = option.textContent;
                this.state.imageState.imageAspectRatio = ratioValue.replace(':', '/');
                this.adjustImageBoxSize(ratioValue);
                this.updateImageDisplay();
            });
        });
    }

    /**
     * Bind download event
     */
    bindDownloadEvent() {
        const { downloadButton } = this.elements;
        if (!downloadButton) return;

        downloadButton.addEventListener('click', () => this.handleDownload());
    }

    /**
     * Handle global clicks for dropdown management
     */
    handleGlobalClick(e) {
        const { outerTypeDropdown, aspectRatioDropdown } = this.elements;
        
        if (outerTypeDropdown && !outerTypeDropdown.contains(e.target)) {
            const options = outerTypeDropdown.querySelector('.dropdown-options');
            if (options) options.classList.remove('show');
        }
        
        if (aspectRatioDropdown && !aspectRatioDropdown.contains(e.target)) {
            const options = aspectRatioDropdown.querySelector('.dropdown-options');
            if (options) options.classList.remove('show');
        }
    }

    /**
     * Load image as data URL to prevent CORS issues
     */
    async loadImageAsDataURL(src) {
        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Failed to load image as data URL:', error);
            return null;
        }
    }

    /**
     * Preload all frame images as data URLs
     */
    async preloadFrames() {
        const basePath = this.getBasePath();
        const loadPromises = [];

        for (const [key, frame] of Object.entries(this.config.frames)) {
            const promise = this.loadFrameImage(key, frame, basePath);
            loadPromises.push(promise);
        }

        await Promise.allSettled(loadPromises);
        console.log('Frame preloading completed');
    }

    /**
     * Load individual frame image
     */
    async loadFrameImage(key, frame, basePath) {
        try {
            const fullPath = basePath + frame.src;
            console.log(`Loading frame ${key} from:`, fullPath);
            
            const dataURL = await this.loadImageAsDataURL(fullPath);
            if (dataURL) {
                this.state.frameDataUrls[key] = dataURL;
                
                const img = new Image();
                img.src = dataURL;
                this.state.frameImages[key] = img;
                
                console.log(`Successfully loaded frame ${key}`);
            } else {
                throw new Error('Failed to convert to data URL');
            }
        } catch (error) {
            console.error(`Error loading frame ${key}:`, error);
        }
    }

    /**
     * Get base path for assets
     */
    getBasePath() {
        return window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
    }

    /**
     * Adjust image box size based on aspect ratio
     */
    adjustImageBoxSize(aspectRatio) {
        const { imageUploadBox } = this.elements;
        if (!imageUploadBox) return;

        const config = this.config.aspectRatios[aspectRatio];
        if (!config) {
            console.warn(`Unknown aspect ratio: ${aspectRatio}`);
            return;
        }

        const { width, height } = config;
        
        imageUploadBox.style.width = `${width}px`;
        imageUploadBox.style.height = `${height}px`;
        imageUploadBox.style.transition = 'width 0.3s ease, height 0.3s ease';
        
        console.log(`Image box resized to: ${width}x${height} for ratio ${aspectRatio}`);
    }

    /**
     * Validate uploaded file
     */
    validateImageFile(file, type = 'image') {
        if (!file) {
            this.showError(`Silakan pilih file ${type} yang valid!`);
            return false;
        }
        
        if (!file.type.match('image.*')) {
            this.showError(`Silakan pilih file ${type} yang valid!`);
            return false;
        }
        
        return true;
    }

    /**
     * Handle main image file upload
     */
    handleFileUpload(file) {
        if (!this.validateImageFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.setUserImage(e.target.result);
        };
        reader.onerror = () => {
            this.showError('Gagal membaca file gambar');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Set user image
     */
    setUserImage(src) {
        const { imageUploadBox, placeholderContent } = this.elements;
        
        // Hide placeholder
        if (placeholderContent) {
            placeholderContent.style.display = 'none';
        }
        
        // Remove existing image
        if (this.state.userImage && this.state.userImage.parentNode === imageUploadBox) {
            imageUploadBox.removeChild(this.state.userImage);
        }
        
        // Create new image
        this.state.userImage = document.createElement('img');
        this.state.userImage.className = 'user-image';
        this.state.userImage.src = src;
        
        imageUploadBox.appendChild(this.state.userImage);
        
        this.updateOuterFrame();
        this.updateImageDisplay();
    }

    /**
     * Handle frame upload
     */
    handleFrameUpload(file) {
        if (!this.validateImageFile(file, 'frame')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.setCustomFrame(e.target.result);
        };
        reader.onerror = () => {
            this.showError('Gagal membaca file frame');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Set custom frame
     */
    setCustomFrame(src) {
        const { outerTypeDropdown } = this.elements;
        
        this.state.customFrameUploaded = true;
        this.state.customFrameImage = new Image();
        this.state.customFrameImage.src = src;
        
        const dropdownText = outerTypeDropdown?.querySelector('.dropdown-text');
        if (dropdownText) {
            dropdownText.textContent = 'Frame Kustom';
        }
        
        this.state.imageState.outerType = 'custom';
        this.updateOuterFrame();
        this.updateImageDisplay();
    }

    /**
     * Update outer frame display
     */
    updateOuterFrame() {
        const { imageUploadBox } = this.elements;
        const { outerType } = this.state.imageState;
        
        // Remove existing frame
        if (this.state.outerFrame && this.state.outerFrame.parentNode === imageUploadBox) {
            imageUploadBox.removeChild(this.state.outerFrame);
            this.state.outerFrame = null;
        }
        
        // Return if no frame needed or no user image
        if (outerType === 'none' || !this.state.userImage) {
            return;
        }
        
        // Create new frame
        this.state.outerFrame = document.createElement('img');
        this.state.outerFrame.className = 'outer-frame';
        
        // Set frame source
        if (this.state.customFrameUploaded && outerType === 'custom') {
            if (this.state.customFrameImage) {
                this.state.outerFrame.src = this.state.customFrameImage.src;
                console.log("Using custom uploaded frame");
            } else {
                console.error("Custom frame not found");
                return;
            }
        } else {
            if (!this.config.frames[outerType]) {
                console.error("Frame not found:", outerType);
                return;
            }
            
            // Use data URL if available, otherwise fallback to original path
            const src = this.state.frameDataUrls[outerType] || 
                       (this.getBasePath() + this.config.frames[outerType].src);
            
            this.state.outerFrame.src = src;
            console.log("Using frame:", outerType);
        }
        
        // Add frame to container
        imageUploadBox.appendChild(this.state.outerFrame);
        
        // Set up event handlers
        this.state.outerFrame.onload = () => {
            console.log("Frame loaded successfully:", outerType);
        };
        
        this.state.outerFrame.onerror = () => {
            console.error("Failed to load frame:", outerType);
        };
    }

    /**
     * Update image display with transformations
     */
    updateImageDisplay() {
        if (!this.state.userImage) return;

        const { imageState } = this.state;
        
        // Calculate user image transformations
        const xPos = (imageState.horizontalPosition - 50) / 50 * 100;
        const yPos = (imageState.verticalPosition - 50) / 50 * 100;
        const scale = 0.5 + (imageState.zoom / 100);
        
        // Apply transformations to user image
        this.state.userImage.style.transform = `translate(${xPos}%, ${yPos}%) scale(${scale})`;
        
        if (imageState.imageAspectRatio) {
            this.state.userImage.style.objectFit = "cover";
            this.state.userImage.style.aspectRatio = imageState.imageAspectRatio;
        }
        
        // Update frame if present
        if (this.state.outerFrame) {
            const frameXPos = (imageState.outerHorizontalPosition - 50) / 50 * 100;
            const frameYPos = (imageState.outerVerticalPosition - 50) / 50 * 100;
            const frameScale = 0.5 + (imageState.outerZoom / 100);
            
            this.state.outerFrame.style.transform = `translate(${frameXPos}%, ${frameYPos}%) scale(${frameScale})`;
            this.state.outerFrame.style.zIndex = "100";
            this.state.outerFrame.style.opacity = "1";
        }
    }

    /**
     * Render current state to canvas for download
     */
    async renderToCanvas() {
        return new Promise((resolve, reject) => {
            const { imageUploadBox } = this.elements;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set high-resolution canvas
            const rect = imageUploadBox.getBoundingClientRect();
            const scale = 2; // Higher resolution
            canvas.width = rect.width * scale;
            canvas.height = rect.height * scale;
            ctx.scale(scale, scale);
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const imagesToLoad = [];
            
            // Add user image
            if (this.state.userImage) {
                imagesToLoad.push({
                    type: 'user',
                    src: this.state.userImage.src
                });
            }
            
            // Add frame
            if (this.state.outerFrame) {
                imagesToLoad.push({
                    type: 'frame',
                    src: this.state.outerFrame.src
                });
            }
            
            if (imagesToLoad.length === 0) {
                reject(new Error('No images to render'));
                return;
            }
            
            let loadedCount = 0;
            const images = {};
            
            // Load all images
            imagesToLoad.forEach(({ type, src }) => {
                const img = new Image();
                img.onload = () => {
                    images[type] = img;
                    loadedCount++;
                    
                    if (loadedCount === imagesToLoad.length) {
                        this.drawToCanvas(ctx, rect, images);
                        resolve(canvas);
                    }
                };
                img.onerror = () => {
                    console.error(`Failed to load ${type} image for rendering`);
                    loadedCount++;
                    
                    if (loadedCount === imagesToLoad.length) {
                        this.drawToCanvas(ctx, rect, images);
                        resolve(canvas);
                    }
                };
                img.src = src;
            });
        });
    }

    /**
     * Draw images to canvas with proper transformations
     */
    drawToCanvas(ctx, rect, images) {
        const { imageState } = this.state;
        
        // Draw user image
        if (images.user) {
            ctx.save();
            this.applyTransformations(ctx, rect, {
                xPos: (imageState.horizontalPosition - 50) / 50 * 100,
                yPos: (imageState.verticalPosition - 50) / 50 * 100,
                scale: 0.5 + (imageState.zoom / 100)
            });
            
            this.drawImageWithAspectRatio(ctx, images.user, rect, imageState.imageAspectRatio);
            ctx.restore();
        }
        
        // Draw frame
        if (images.frame) {
            ctx.save();
            this.applyTransformations(ctx, rect, {
                xPos: (imageState.outerHorizontalPosition - 50) / 50 * 100,
                yPos: (imageState.outerVerticalPosition - 50) / 50 * 100,
                scale: 0.5 + (imageState.outerZoom / 100)
            });
            
            ctx.drawImage(images.frame, 0, 0, rect.width, rect.height);
            ctx.restore();
        }
    }

    /**
     * Apply transformations to canvas context
     */
    applyTransformations(ctx, rect, { xPos, yPos, scale }) {
        ctx.translate(rect.width / 2, rect.height / 2);
        ctx.translate(xPos * rect.width / 100, yPos * rect.height / 100);
        ctx.scale(scale, scale);
        ctx.translate(-rect.width / 2, -rect.height / 2);
    }

    /**
     * Draw image with aspect ratio consideration
     */
    drawImageWithAspectRatio(ctx, image, rect, aspectRatio) {
        if (!aspectRatio) {
            ctx.drawImage(image, 0, 0, rect.width, rect.height);
            return;
        }
        
        const [ratioW, ratioH] = aspectRatio.split('/').map(Number);
        const targetAspectRatio = ratioW / ratioH;
        const boxAspectRatio = rect.width / rect.height;
        
        let drawWidth = rect.width;
        let drawHeight = rect.height;
        let drawX = 0;
        let drawY = 0;
        
        if (targetAspectRatio > boxAspectRatio) {
            drawHeight = rect.width / targetAspectRatio;
            drawY = (rect.height - drawHeight) / 2;
        } else {
            drawWidth = rect.height * targetAspectRatio;
            drawX = (rect.width - drawWidth) / 2;
        }
        
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    }

    /**
     * Handle download functionality
     */
    async handleDownload() {
        if (!this.state.userImage) {
            this.showError('Anda harus mengupload gambar terlebih dahulu!');
            return;
        }

        const { downloadButton } = this.elements;
        const originalText = downloadButton.textContent;
        
        this.setDownloadState(true, 'Memproses...');

        try {
            console.log('Starting canvas rendering...');
            const canvas = await this.renderToCanvas();
            await this.downloadCanvas(canvas);
            console.log('Download completed successfully');
        } catch (error) {
            console.error("Custom rendering failed, trying html2canvas:", error);
            await this.fallbackDownload();
        } finally {
            this.setDownloadState(false, originalText);
        }
    }

    /**
     * Set download button state
     */
    setDownloadState(disabled, text) {
        const { downloadButton } = this.elements;
        if (downloadButton) {
            downloadButton.disabled = disabled;
            downloadButton.textContent = text;
        }
    }

    /**
     * Download canvas as image
     */
    async downloadCanvas(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Failed to create blob from canvas'));
                    return;
                }
                
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `edited-image-${Date.now()}.png`;
                link.href = url;
                
                document.body.appendChild(link);
                link.click();
                
                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    resolve();
                }, 100);
            }, 'image/png');
        });
    }

    /**
     * Fallback download using html2canvas
     */
    async fallbackDownload() {
        try {
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas not available');
            }
            
            const canvas = await html2canvas(this.elements.imageUploadBox, {
                allowTaint: true,
                useCORS: false,
                scale: 2,
                backgroundColor: null,
                logging: false
            });
            
            await this.downloadCanvas(canvas);
        } catch (error) {
            console.error("Fallback download failed:", error);
            this.showError('Gagal mendownload gambar. Pastikan Anda menjalankan aplikasi melalui web server.');
        }
    }

    /**
     * Initialize slider controls
     */
    initializeSliders() {
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => this.initializeSlider(slider));
    }

    /**
     * Initialize individual slider
     */
    initializeSlider(slider) {
        const control = slider.getAttribute('data-control');
        if (!control || !(control in this.state.imageState)) {
            console.warn(`Invalid slider control: ${control}`);
            return;
        }

        const handle = slider.querySelector('.slider-handle');
        const fill = slider.querySelector('.slider-fill');
        
        if (!handle || !fill) {
            console.warn('Slider missing required elements');
            return;
        }

        // Initialize UI
        this.updateSliderUI(slider, this.state.imageState[control]);

        // Mouse events
        this.bindSliderEvents(slider, control);
        
        // Arrow button events
        this.bindSliderArrows(slider, control);
    }

    /**
     * Bind slider drag events
     */
    bindSliderEvents(slider, control) {
        const handle = slider.querySelector('.slider-handle');
        
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const rect = slider.getBoundingClientRect();
            
            const handleMouseMove = (e) => {
                const relativeX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const value = Math.round((relativeX / rect.width) * 100);
                this.updateSliderValue(slider, control, value);
            };
            
            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        // Click to position
        slider.addEventListener('click', (e) => {
            if (e.target === handle) return;
            
            const rect = slider.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const value = Math.round((relativeX / rect.width) * 100);
            this.updateSliderValue(slider, control, value);
        });
    }

    /**
     * Bind slider arrow button events
     */
    bindSliderArrows(slider, control) {
        const container = slider.parentElement;
        const decreaseArrow = container.querySelector('.decrease');
        const increaseArrow = container.querySelector('.increase');
        
        if (decreaseArrow) {
            decreaseArrow.addEventListener('click', () => {
                const currentValue = this.state.imageState[control];
                const newValue = Math.max(0, currentValue - 5);
                this.updateSliderValue(slider, control, newValue);
            });
        }
        
        if (increaseArrow) {
            increaseArrow.addEventListener('click', () => {
                const currentValue = this.state.imageState[control];
                const newValue = Math.min(100, currentValue + 5);
                this.updateSliderValue(slider, control, newValue);
            });
        }
    }

    /**
     * Update slider value and state
     */
    updateSliderValue(slider, control, value) {
        this.state.imageState[control] = value;
        this.updateSliderUI(slider, value);
        this.updateImageDisplay();
    }

    /**
     * Update slider UI elements
     */
    updateSliderUI(slider, value) {
        const handle = slider.querySelector('.slider-handle');
        const fill = slider.querySelector('.slider-fill');
        
        if (handle) handle.style.left = `${value}%`;
        if (fill) fill.style.width = `${value}%`;
    }

    /**
     * Mark active navigation link
     */
    markActiveNavLink() {
        const links = document.querySelectorAll("a");
        links.forEach(link => {
            if (link.href === window.location.href) {
                link.classList.add("active");
            }
        });
    }

    /**
     * Test frame image accessibility
     */
    testFrameImages() {
        console.log("Testing frame image accessibility...");
        const basePath = this.getBasePath();
        
        Object.entries(this.config.frames).forEach(([key, frame]) => {
            const frameSrc = basePath + frame.src;
            fetch(frameSrc)
                .then(response => {
                    const status = response.ok ? 'accessible' : `error ${response.status}`;
                    console.log(`Frame ${key}: ${status}`);
                })
                .catch(error => {
                    console.error(`Frame ${key} fetch error:`, error.message);
                });
        });
    }

    /**
     * Show error message to user
     */
    showError(message) {
        alert(message);
        console.error(message);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.imageEditor = new ImageEditor();
});

// Duplicate navigation link marking (for compatibility)
document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll("a");
    links.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add("active");
        }
    });
});
