/*
Copyright (c) 2011 Cimaron Shanahan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


(function(cnvgl) {


	/**
	 * glBindBuffer � bind a named buffer object
	 *
	 * @var GLenum  target  Specifies the target to which the buffer object is bound. The symbolic constant must be GL_ARRAY_BUFFER, GL_ELEMENT_ARRAY_BUFFER, GL_PIXEL_PACK_BUFFER, or GL_PIXEL_UNPACK_BUFFER.
	 * @var GLuint  buffer  Specifies the name of a buffer object.
	 *
	 * Notes: See http://www.opengl.org/sdk/docs/man/xhtml/glBindBuffer.xml
	 */
	cnvgl.bindBuffer = function(target, buffer) {
		var ctx, buffer_obj;
	
		ctx = cnvgl_context.getCurrentContext();
		
		if (buffer != 0) {
		
			buffer_obj = cnvgl_objects[buffer];
		
			//buffer does not exist
			if (!buffer_obj) {
				cnvgl_throw_error(GL_INVALID_VALUE);
				return;
			}

			//not a buffer object
			if (!buffer_obj instanceof cnvgl_buffer) {
				cnvgl_throw_error(GL_INVALID_OPERATION);
				return;
			}

			buffer_obj.access = GL_READ_WRITE;
			buffer_obj.usage = GL_STATIC_DRAW;
	
		} else {
			buffer_obj = null;	
		}
	
		switch (target) {
			case GL_ARRAY_BUFFER:
				ctx.array.arrayBufferObj = buffer_obj;
				break;
			case GL_ELEMENT_ARRAY_BUFFER:
				ctx.array.elementArrayBufferObj = buffer_obj;
				break;
			default:
				cnvgl_throw_error(GL_INVALID_ENUM);
		}
	};


	/**
	 * glBufferData � creates and initializes a buffer object's data store
	 *
	 * @var GLenum      target  Specifies the target buffer object. The symbolic constant must be GL_ARRAY_BUFFER, GL_ELEMENT_ARRAY_BUFFER, GL_PIXEL_PACK_BUFFER, or GL_PIXEL_UNPACK_BUFFER.
	 * @var GLsizeiptr  size    Specifies the size in bytes of the buffer object's new data store.
	 * @var [GLvoid?]   data    Specifies a pointer to data that will be copied into the data store for initialization, or NULL if no data is to be copied.
	 * @var GLenum      usage   Specifies the expected usage pattern of the data store. The symbolic constant must be GL_STREAM_DRAW, GL_STREAM_READ, GL_STREAM_COPY, GL_STATIC_DRAW, GL_STATIC_READ, GL_STATIC_COPY, GL_DYNAMIC_DRAW, GL_DYNAMIC_READ, or GL_DYNAMIC_COPY.
	 *
	 * Notes: See http://www.opengl.org/sdk/docs/man/xhtml/glBufferData.xml
	 */
	cnvgl.bufferData = function(target, size, data, usage) {
		var ctx, buffer_obj, data_type, view, temp, i;

		ctx = cnvgl_context.getCurrentContext();
	
		if (usage != GL_STREAM_DRAW &&
				usage != GL_STREAM_READ && 
				usage != GL_STREAM_COPY &&
				usage != GL_STATIC_DRAW &&
				usage != GL_STATIC_READ &&
				usage != GL_STATIC_COPY &&
				usage != GL_DYNAMIC_DRAW &&
				usage != GL_DYNAMIC_READ && 
				usage != GL_DYNAMIC_COPY) {
	
			cnvgl_throw_error(GL_INVALID_ENUM);
			return;
		}
	
		if (size < 0) {
			cnvgl_throw_error(GL_INVALID_VALUE);
			return;
		}
	
		switch (target) {
			case GL_ARRAY_BUFFER:
				buffer_obj = ctx.array.arrayBufferObj;
				break;
			case GL_ELEMENT_ARRAY_BUFFER:
				buffer_obj = ctx.array.elementArrayBufferObj;
				break;
			default:
				cnvgl_throw_error(GL_INVALID_ENUM);
				return;
		}
		
		if (!buffer_obj) {
			cnvgl_throw_error(GL_INVALID_OPERATION);
			return;
		}
	
		buffer_obj.target = target;
		buffer_obj.usage = usage;
		buffer_obj.size = size;
	
		data_type = TypedArray.getType(data);
		view = new ArrayBuffer(size);
		if (data) {
			size /= data_type.BYTES_PER_ELEMENT;
			if (ArrayBuffer.native) {
				temp = new data_type(view);
			} else {
				temp = view;	
			}
			for (i = 0; i < size; i++) {
				temp[i] = data[i];
			}
		}
	
		if (data_type != ArrayBuffer) {
			buffer_obj.data_type = data_type;
		}
		buffer_obj.data = view;
	};


	/**
	 * glBufferSubData � updates a subset of a buffer object's data store
	 *
	 * @var GLenum      target  Specifies the target buffer object. The symbolic constant must be GL_ARRAY_BUFFER, GL_ELEMENT_ARRAY_BUFFER, GL_PIXEL_PACK_BUFFER, or GL_PIXEL_UNPACK_BUFFER.
	 * @var GLintptr    offset  Specifies the offset into the buffer object's data store where data replacement will begin, measured in bytes.
	 * @var GLsizeiptr  size    Specifies the size in bytes of the data store region being replaced.
	 * @var [GLvoid]    data    Specifies a pointer to the new data that will be copied into the data store.
	 *
	 * Notes: See http://www.opengl.org/sdk/docs/man/xhtml/glBufferSubData.xml
	 */
	cnvgl.bufferSubData = function(target, offset, size, data) {
		var ctx, buffer_obj, view, data_type, temp, i;
	
		ctx = cnvgl_context.getCurrentContext();
	
		switch (target) {
			case GL_ARRAY_BUFFER:
				buffer_obj = ctx.array.arrayBufferObj;
				break;
			case GL_ELEMENT_ARRAY_BUFFER:
				bufer_obj = ctx.array.elementArrayBufferObj;
				break;
			default:
				cnvgl_throw_error(GL_INVALID_ENUM);
				return;
		}
		
		if (!buffer_obj) {
			cnvgl_throw_error(GL_INVALID_OPERATION);
			return;
		}
	
		if (offset < 0 || size < 0 || offset + size > buffer_obj.size) {
			cnvgl_throw_error(GL_INVALID_VALUE);
			return;
		}
		
		data_type = TypedArray.getType(data);
		view = buffer_obj.data;
		if (ArrayBuffer.native) {
			offset /= data_type.BYTES_PER_ELEMENT;
			size /= data_type.BYTES_PER_ELEMENT;
			temp = data_type(view);
		} else {
			temp = view;
		}
	
		for (i = 0; i < size; i++) {
			temp[offset + i] = data[i];
		}
	
		if (!buffer_obj.data_type && data_type != ArrayBuffer) {
			buffer_obj.data_type = data_type;
		}
	};


	/**
	 * glGenBuffers � generate buffer object names
	 *
	 * @var GLsizei   n        Specifies the number of buffer object names to be generated.
	 * @var [GLuint]  buffers  Specifies an array in which the generated buffer object names are stored.
	 *
	 * Notes: See http://www.opengl.org/sdk/docs/man/xhtml/glGenBuffers.xml
	 */
	cnvgl.genBuffers = function(n, buffers) {
		var list = [], buffer, ref, i;

		for (i = 0; i < n; i++) {
			buffer = new cnvgl_buffer();
			cnvgl_objects.push(buffer);
			ref = cnvgl_objects.length - 1;
			list.push(ref);
		}

		buffers[0] = list;
	}


}(cnvgl));

