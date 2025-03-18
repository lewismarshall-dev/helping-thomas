'use strict';

let last = { x: 0, y: 0 };
let imageList = [];
let index = 0;
let transition = 0.75;

// Fetch placeholder images
fetch('https://picsum.photos/v2/list?limit=100')
  .then((response) => response.json())
  .then((images) => {
    images.forEach((image) => {
      const img = new Image();
      img.src = image.download_url;
      img.className = 'img';
      imageList.push(img);
    });
  })
  .catch((error) => console.error('Error:', error));

// Observe mouse movement
document.addEventListener('mousemove', (event) => {
  // Set current cursor position
  const current = { x: event.clientX, y: event.clientY };

  // If the cursor has moved more than 50 pixels
  if (calcPositionDistance(last, current) > 50) {
    // Add image from list to the DOM
    const img = imageList[index].cloneNode();
    document.body.appendChild(img);

    img.onload = () => {
      // Set image center position to cursor, set image visible
      img.style.left = current.x - img.width / 2 + 'px';
      img.style.top = current.y - img.height / 2 + 'px';
      img.style.visibility = 'visible';

      // Transition in: scale from 0.5 to 1
      gsap.from(img, { scale: 0.5, duration: transition });

      // Transition out after 1 second: scale to 0.5, fade out, remove from DOM
      gsap.to(img, {
        autoAlpha: 0,
        scale: 0.5,
        duration: transition,
        delay: 1,
        onComplete: () => img.remove(),
      });

      // Set last cursor position to current
      last = current;

      // Set next image index
      index = (index + 1) % imageList.length;
    };
  }
});

function calcPositionDistance(last, current) {
  return Math.sqrt(Math.pow(current.x - last.x, 2) + Math.pow(current.y - last.y, 2));
}
