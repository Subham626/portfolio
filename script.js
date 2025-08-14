document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const projectsContainer = document.querySelector('#projects .projects-grid');

    // Gallery Modal Elements
    const galleryModal = document.getElementById('gallery-modal');
    const galleryGrid = document.getElementById('gallery-grid');
    const closeGalleryBtn = document.querySelector('#gallery-modal .close-button');

    // Image Viewer Modal Elements
    const imageViewerModal = document.getElementById('image-viewer-modal');
    const modalImage = document.getElementById('modal-image');
    const closeImageViewerBtn = document.querySelector('#image-viewer-modal .close-button');
    const prevButton = document.querySelector('#image-viewer-modal .prev');
    const nextButton = document.querySelector('#image-viewer-modal .next');

    // --- State ---
    let allProjects = [];
    let currentGalleryImages = [];
    let currentImageIndex = 0;

    // --- Functions ---

    // Opens the collage view
    const openGallery = (projectIndex) => {
        const project = allProjects[projectIndex];
        const images = project.images || (project.image ? [project.image] : []);
        if (images.length === 0) return;

        galleryGrid.innerHTML = ''; // Clear previous images

        images.forEach((imgSrc, index) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = `${project.title} screenshot ${index + 1}`;
            img.addEventListener('click', () => {
                openImageViewer(images, index);
            });
            galleryGrid.appendChild(img);
        });

        galleryModal.style.display = 'block';
    };

    const closeGallery = () => {
        galleryModal.style.display = 'none';
    };

    // Opens the single image viewer from the collage
    const openImageViewer = (images, startIndex) => {
        currentGalleryImages = images;
        currentImageIndex = startIndex;
        updateImageViewerImage();
        imageViewerModal.style.display = 'block';
    };

    const closeImageViewer = () => {
        imageViewerModal.style.display = 'none';
    };

    const changeImage = (direction) => {
        currentImageIndex += direction;
        if (currentImageIndex >= currentGalleryImages.length) {
            currentImageIndex = 0; // Wrap to start
        }
        if (currentImageIndex < 0) {
            currentImageIndex = currentGalleryImages.length - 1; // Wrap to end
        }
        updateImageViewerImage();
    };

    const updateImageViewerImage = () => {
        modalImage.src = currentGalleryImages[currentImageIndex];
        // Show/hide nav buttons if there's only one image
        if (currentGalleryImages.length <= 1) {
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        } else {
            prevButton.style.display = 'block';
            nextButton.style.display = 'block';
        }
    };

    // --- Event Listeners ---
    closeGalleryBtn.addEventListener('click', closeGallery);
    galleryModal.addEventListener('click', (e) => e.target === galleryModal && closeGallery());

    closeImageViewerBtn.addEventListener('click', closeImageViewer);
    imageViewerModal.addEventListener('click', (e) => e.target === imageViewerModal && closeImageViewer());

    prevButton.addEventListener('click', () => changeImage(-1));
    nextButton.addEventListener('click', () => changeImage(1));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeGallery();
            closeImageViewer();
        }
    });

    // --- Fetch and Render Projects ---
    fetch('projects.json')
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(projects => {
            allProjects = projects; // Store projects data

            projects.forEach((project, index) => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project';

                // Use the "image" property as the thumbnail, or the first from an "images" array if it exists.
                const thumbnail = project.image || (project.images && project.images.length > 0 ? project.images[0] : '');
                
                const imageCount = project.images ? project.images.length : (project.image ? 1 : 0);

                projectCard.innerHTML = `
                    ${thumbnail ? `<img src="${thumbnail}" alt="${project.title} thumbnail">` : ''}
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    ${imageCount > 0 ? `<div class="project-footer"><button class="gallery-button">View Screenshots</button></div>` : ''}
                `;

                if (imageCount > 0) {
                    projectCard.addEventListener('click', () => openGallery(index));
                } else {
                    projectCard.style.cursor = 'default';
                }

                projectsContainer.appendChild(projectCard);
            });
        })
        .catch(error => {
            console.error('Error fetching projects:', error);
            projectsContainer.innerHTML = '<p>Could not load projects at this time. Please try again later.</p>';
        });
});