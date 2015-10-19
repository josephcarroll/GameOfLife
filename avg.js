function Avg (sampleSize) {
    this.sampleSize = sampleSize;
    this.samples = [];
}

Avg.prototype.sample = function(value) {
    this.samples.push(value);
    if (this.samples.length >= this.sampleSize) {
        this.samples = this.samples.slice(1, this.sampleSize);
    }
};

Avg.prototype.get = function() {
    var sum = 0;
    for(var i = 0; i < this.samples.length; i++) {
        sum = sum + this.samples[i];
    }
    return sum / this.samples.length;
};