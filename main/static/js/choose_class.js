function createSpark(container, isOutside = false) {
    let spark = document.createElement('div');
    spark.classList.add('spark');
    container.appendChild(spark);

    let size = Math.random() * 3 + 1;
    let angle = Math.random() * Math.PI * 2;
    let distance = isOutside ? Math.random() * 50 + 100 : Math.random() * 100;
    let positionX = Math.cos(angle) * distance + 100;
    let positionY = Math.sin(angle) * distance + 100;
    let animationDuration = Math.random() * 1 + 0.5;

    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.left = `${positionX}px`;
    spark.style.top = `${positionY}px`;
    spark.style.animation = `sparkle ${animationDuration}s linear infinite`;
}

function intensifySparks(circle) {
    circle.innerHTML = `<span class="class-name">${circle.querySelector('.class-name').textContent}</span>`;
    for (let i = 0; i < 100; i++) {
        createSpark(circle, i >= 50);
    }
}

function selectClass(className) {
    let selectedCircle = document.querySelector(`.class-circle[onclick*="${className}"]`);

    if (selectedCircle.classList.contains('selected')) {
        // Deselect if already selected
        selectedCircle.classList.remove('selected');
        document.getElementById('confirmButton').disabled = true;
        document.getElementById('confirmButton').classList.remove('active');
        document.getElementById('selected_class').value = '';
        hideBackgroundImage();
    } else {
        // Select the new class
        document.querySelectorAll('.class-circle').forEach(circle => {
            circle.classList.remove('selected');
            circle.innerHTML = `<span class="class-name">${circle.querySelector('.class-name').textContent}</span>`;
        });

        selectedCircle.classList.add('selected');
        intensifySparks(selectedCircle);

        document.getElementById('confirmButton').disabled = false;
        document.getElementById('confirmButton').classList.add('active');
        document.getElementById('selected_class').value = className;
        showBackgroundImage(className.toLowerCase());
    }
}

function submitForm() {
    if (!document.getElementById('confirmButton').disabled) {
        document.getElementById('classForm').submit();
    }
}

function showBackgroundImage(className) {
    let backgroundImage = document.querySelector('.background-image');
    if (!backgroundImage) {
        backgroundImage = document.createElement('div');
        backgroundImage.classList.add('background-image');
        document.querySelector('.content').appendChild(backgroundImage);
    }
    backgroundImage.style.backgroundImage = `url('/static/classes/${className}.png')`;
    backgroundImage.style.opacity = '0.3';
}

function hideBackgroundImage() {
    let backgroundImage = document.querySelector('.background-image');
    if (backgroundImage) {
        backgroundImage.style.opacity = '0';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.class-circle').forEach(circle => {
        circle.addEventListener('mouseover', function() {
            intensifySparks(this);
            showBackgroundImage(this.querySelector('.class-name').textContent.toLowerCase());
        });

        circle.addEventListener('mouseout', function() {
            if (!this.classList.contains('selected')) {
                this.innerHTML = `<span class="class-name">${this.querySelector('.class-name').textContent}</span>`;
                hideBackgroundImage();
            }
        });
    });

    document.getElementById('confirmButton').addEventListener('click', submitForm);
});