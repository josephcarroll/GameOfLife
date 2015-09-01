function Avg (sampleSize) {
    this.sampleSize = sampleSize;
    this.samples = new Array(sampleSize);
    this.sampleCount = 0;
}

Avg.prototype.sample = function(value) {
	this.samples[this.sampleCount++] = value;
	if (this.sampleCount >= this.sampleSize) {
		this.samples = this.samples.slice(1, this.sampleSize);
	}
};

Avg.prototype.get = function() {
	var sum = 0;
	for(var i = 0; i < this.sampleCount; i++) {
		sum = sum + this.samples[i];
	}
	return sum / this.sampleCount;
};