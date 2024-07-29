document.addEventListener('DOMContentLoaded', function () {
    const textSegments = [
        "In the shadowy expanses of the galaxy, where the stars whisper ancient secrets and danger lurks in the forgotten corners of space, lies Ruin—a desolate, sandy planet cloaked in perpetual danger.",
        "This arid world, dominated by crimson dunes and towering rock formations, is home to some of the galaxy's most lethal creatures: gigantic lizard-like beasts that roam the wastelands, deadly scorpions with venom that can melt metal, and cunning bipedal entities, whose primitive intelligence and tribal societies pose unexpected threats.",
        "Your battle for survival, for revenge, and for the future of the cosmos starts with a single step into the red sands."
    ];

    const terminal = document.getElementById('terminal');
    const imageContainer = document.getElementById('game-image');
    const images = imageContainer.getAttribute('data-images').split(', ');
    const skipButton = document.getElementById('skip-button');

    let currentSegment = 0;
    let isTyping = false;

    function changeImage() {
        if (currentSegment < images.length - 1) {
            imageContainer.classList.remove('active');
            setTimeout(() => {
                imageContainer.src = images[currentSegment].trim();
                imageContainer.classList.add('active');
            }, 1000);
        }
    }

    function typeWriter() {
        if (currentSegment < textSegments.length) {
            isTyping = true;
            terminal.textContent = "";
            let text = textSegments[currentSegment];
            let i = 0;
            function typeNextChar() {
                if (i < text.length) {
                    terminal.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeNextChar, 25);
                } else {
                    isTyping = false;
                    setTimeout(() => {
                        if (currentSegment < images.length - 1) {
                            changeImage();
                        }
                        currentSegment++;
                        if (currentSegment < textSegments.length) {
                            setTimeout(typeWriter, 3000);
                        } else {
                            setTimeout(finishIntro, 3000);
                        }
                    }, 3000);
                }
            }
            typeNextChar();
        }
    }

    function finishIntro() {
        const form = document.getElementById('intro-complete-form');
        if (form) {
            form.submit();
        } else {
            window.location.href = '/main/game/';
        }
    }

    skipButton.addEventListener('click', function(event) {
        event.preventDefault();
        finishIntro();
    });

    typeWriter();
});