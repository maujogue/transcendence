export class ReplayBuffer {
    constructor(bufferSize) {
        this.bufferSize = bufferSize;
        this.buffer = [];
    }

    addExperience(experience) {
        if (this.buffer.length >= this.bufferSize) {
            this.buffer.shift(); // Remove the oldest experience if buffer is full
        }
        this.buffer.push(experience);
    }

    sample(batchSize) {
        const experiences = [];
        for (let i = 0; i < batchSize; i++) {
            const index = Math.floor(Math.random() * this.buffer.length);
            experiences.push(this.buffer[index]);
        }
        return experiences;
    }
}
