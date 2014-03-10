

function ByteArray() {
	// our array of 8 bytes
	this.bytes = new ArrayBuffer(8);
	// these views allow us to extract data from 
	//  the buffer like a union in c!
	this.float64 = new Float64Array(this.bytes);
	this.int64 = new Int32Array(this.bytes);
	this.uint64 = new Uint32Array(this.bytes);
}

ByteArray.prototype.setFloat64 = function(num) {
	this.float64[0] = num;
};
ByteArray.prototype.getFloat64 = function() {
	return this.float64[0];
};

ByteArray.prototype.setUint64 = function(num) {
	this.uint64[1] = num / 4294967296;
	this.uint64[0] = num % 4294967296;	
};
ByteArray.prototype.getUint64 = function() {
	return this.uint64[0] + 4294967296*this.uint64[1]; 
};

ByteArray.prototype.setInt64 = function(num) {
	if (num < 0) {
		num = Math.abs(num)
		// 2's compliment low bits
		var lowbits = -(num % 4294967296);
		// in case of overflow, get the low bits again
		this.int64[0] = -(Math.abs(lowbits) % 4294967296);
		// if we have overflow (r == 0), take the 2's compliment of
		//  the high bits, otherwise we just want the compliment
		this.int64[1] = (lowbits == 0) ? -(num / 4294967296) : ~(num / 4294967296);
	} else {
		this.int64[1] = num / 4294967296;
		this.uint64[0] = num % 4294967296;
	}
};
ByteArray.prototype.getInt64 = function() {
	if (this.int64[1] < 0) {
		// If we are negative then we have to either do the 2's complement on 
		//  the high bits or the low bits, and just compliment the other. If the  
		//  low bits are all 0 then we know we have to 2's comp the high bits as 
		//  we had overflow when we 2's comped it before. This get the magnitude 
		//  of the value, we negate to get the actual val back.
		var lowbits = (this.uint64[0] == 0) ? ~(this.uint64[0]): ~(this.uint64[0]) + 1;
		var highbits = (this.uint64[0] == 0) ? ~(this.uint64[1]) + 1: ~(this.uint64[1]);
		return -(lowbits + 4294967296*highbits);
	} else {
		return this.getUint64();
	}
};

ByteArray.prototype.setUint32 = function(num) {
	// if num % 1 return error?
	this.uint64[0] = num;
	this.uint64[1] = 0;	
};
ByteArray.prototype.getUint32 = function() {
	return this.uint64[0];
};

ByteArray.prototype.setInt32 = function(num) {
	// if (num % 1) throw new Error('Float passed to setInt32');
	this.int64[0] = num;
	this.int64[1] = 0;
};
ByteArray.prototype.getInt32 = function() {
	return this.int64[0];
};


// b = new ByteArray()
// b.setInt32(-1);
// console.log(b.int64[0]);
// console.log(b.uint64[0]);

// b.setFloat64(-1.1);
// console.log(b.float64[0]);
// console.log(b.int64[0]);
// console.log(b.int64[1]);

// b.setUint64(4294967299);
// console.log(b.uint64[0] + 4294967296*b.uint64[1]);

// b.setInt64(-100000000000);
// console.log(b.getInt64());

exports.ByteArray = ByteArray;