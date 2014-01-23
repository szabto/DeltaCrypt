function copyProperties( to, from ) {
	for (var attr in from) {
		if (from.hasOwnProperty(attr))
			to[attr] = from[attr];
	}
	return to;
}

(function(a,b){
	function delta() {
		this.challenge = null;
		this.lastreliable = null;
		this.stack = [];
		this.init();
	};
	copyProperties(delta.prototype, {
		init: function() {
			var _t = this;
			$.ajax({
				method: 'get',
				url: 'comm.php?getchallenge',
				success: function(r) {
					r = _t.parseResponse(r);
					_t.callStack();
				}
			});
		},
		asyncGet: function(url, params) {
			var _t = this;
			$.ajax({
				method: 'post',
				url: 'comm.php?delta',
				data: {
					'd': _t.enc(url),
					'p': _t.enc(params),
					'lastreliable': _t.lastreliable
				},
				success: function(r) {
					r = _t.parseResponse(r);
				}
			});
		},
		asyncPost: function(url, params, data) {
			var _t = this;
			$.ajax({
				method: 'post',
				url: 'comm.php?delta',
				data: {
					'p': _t.enc(params),
					'd': _t.enc(url),
					'o': _t.enc(data),
					'lastreliable': _t.lastreliable
				},
				success: function(r) {
					r = _t.parseResponse(r);
				}
			});
		},
		toArray: function(t) {
			t = t.substring(1);
			t = t.split("/");
			o = {};
			curr = false;
			for(var i=0;i<t.length;i++) {
				if( !curr )
					curr = t[i];
				else
					o[curr] = t[i], curr = false;
			}
			return o;
		},
		arrayToString: function(t) {
			o = "/";
			o += t.join("/");

			return o;
		},
		parseResponse: function(r) {
			this.lastreliable = r;
			r = this.toArray(r);
		},
		enc: function(s) {
			if( this.lastreliable ) {
				var o = "", q = 0;

				for( var i=0;i<s.length;i++ ) {
					q ++;
					if( q >= this.lastreliable.length ) 
						q = 0;

					o += String.fromCharCode(this.lastreliable.charCodeAt(q) ^ s.charCodeAt(i));
				}

				return o;
			}
			return s;
		},
		onInited: function(cb) {
			if( !this.challenge ) {
				this.stack.push(cb);
			}
			else {
				cb();
			}
		},
		callStack: function() {
			if( this.stack.length ) {
				for( var i=0; i<this.stack.length; i++ ) {
					this.stack[i]();
					this.stack.splice(i);
				}
			}
		}
	});
	b.delta = new delta();
})(jQuery, window);

delta.onInited(function() {
	delta.asyncGet("alfa.php", "?a=b&b=c");
	delta.asyncPost("beta.php", "?a=b&b=c", "a&b&v");
});