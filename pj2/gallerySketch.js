const gallerySketch = (p) => {
  let galleryBG;      // The background image of the gallery
  let artworks = [];  // Array to hold artwork images

  p.preload = function() {
    // Load the gallery background image (use the correct file path/extension)
    galleryBG = p.loadImage('assets/galleryBG.png');
  };

  p.setup = function() {
    // Create the canvas inside the #galleryContainer div
    p.createCanvas(800, 600);

    // If you want to let the user upload an image:
    // (This creates a file input element on the page.)
    p.createFileInput(handleFile).position(10, 10);
  };

  p.draw = function() {
    // Draw the background gallery
    p.background(255);
    p.image(galleryBG, 0, 0, p.width, p.height);

    // Position each artwork in the gallery
    // For simplicity, place them side by side along a “wall.”
    let xOffset = 100;   // x-position for first image
    let yOffset = 150;   // y-position of the "wall"
    let spacing = 220;   // spacing between images

    for (let i = 0; i < artworks.length; i++) {
      let art = artworks[i];

      // Frame size for each artwork
      let frameWidth = 200;
      let frameHeight = 150;

      // Draw a “frame” (optional)
      p.stroke(80, 42, 20); // brownish color
      p.strokeWeight(4);
      p.fill(255, 230, 200); // light color inside the frame
      p.rect(xOffset + i * spacing, yOffset, frameWidth, frameHeight);

      // Draw the artwork inside the frame
      p.image(art, xOffset + i * spacing, yOffset, frameWidth, frameHeight);
    }
  };

  // Triggered by createFileInput when a file is selected
  function handleFile(file) {
    // If it's an image file, load it as a p5.Image
    if (file.type === 'image') {
      let newArtwork = p.loadImage(file.data, () => {
        artworks.push(newArtwork);
      });
    } else {
      console.log('Not an image file!');
    }
  }
};

// Instantiate the sketch and attach it to the #galleryContainer div
new p5(gallerySketch, 'galleryContainer');
