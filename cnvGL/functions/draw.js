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
	 * glDrawArrays � render primitives from array data
	 *
	 * @var GLenum   mode   Specifies what kind of primitives to render. Symbolic constants GL_POINTS, GL_LINE_STRIP, GL_LINE_LOOP, GL_LINES, GL_TRIANGLE_STRIP, GL_TRIANGLE_FAN, GL_TRIANGLES, GL_QUAD_STRIP, GL_QUADS, and GL_POLYGON are accepted.
	 * @var GLint    first  Specifies the starting index in the enabled arrays.
	 * @var GLsizei  count  Specifies the number of indices to be rendered.
	 *
	 * Notes: See http://www.opengl.org/sdk/docs/man/xhtml/glDrawArrays.xml
	 */
	cnvgl.drawArrays = function(mode, first, count) {
		var ctx, renderer, program_obj, i, vertex;
	
		ctx = cnvgl.getCurrentContext();
		renderer = ctx.renderer;
		program_obj = ctx.shader.activeProgram;
	
		renderer.setMode(mode);
	
		//each vertex
		for (i = first; i < count; i++) {
			vertex = new cnvgl_vertex();
			cnvgl_copy_initialize_attribute_data(ctx, program_obj, i, vertex);
			renderer.send(vertex);
		}
	
		renderer.end();
	};


	/**
	 * glDrawElements � render primitives from array data
	 *
	 * @var GLenum    mode     Specifies what kind of primitives to render. Symbolic constants GL_POINTS, GL_LINE_STRIP, GL_LINE_LOOP, GL_LINES, GL_TRIANGLE_STRIP, GL_TRIANGLE_FAN, GL_TRIANGLES, GL_QUAD_STRIP, GL_QUADS, and GL_POLYGON are accepted.
	 * @var GLsizei   count    Specifies the number of elements to be rendered.
	 * @var GLenum    type     Specifies the type of the values in indices. Must be one of GL_UNSIGNED_BYTE, GL_UNSIGNED_SHORT, or GL_UNSIGNED_INT.
	 * @var [GLvoid]  indices  Specifies a pointer to the location where the indices are stored.
	 *
	 * Notes: See http://www.opengl.org/sdk/docs/man/xhtml/glDrawElements.xml
	 */
	function glDrawElements(mode, count, type, indices) {
		var ctx, renderer, program_obj, buffer_obj, elements, i, vertex, index;

		ctx = cnvgl.getCurrentContext();
		renderer = ctx.renderer;
		program_obj = ctx.shader.activeProgram;
	
		renderer.setMode(mode);
	
		buffer_obj = ctx.array.elementArrayBufferObj;
		elements = buffer_obj.getData();
	
		//each vertex
		for (i = 0; i < count; i++) {
			index = elements[i + indices];
			vertex = new cnvgl_vertex();
			cnvgl_copy_initialize_attribute_data(ctx, program_obj, index, vertex);
			renderer.send(vertex);
		}
	
		renderer.end();
	}

	
	function cnvgl_copy_initialize_attribute_data(ctx, program_obj, index, vertex) {
		var a, default_value, arrays, attrib_obj, data, buffer_obj, buffer_data, start;
	
		arrays = ctx.array.arrayObj.vertexAttrib;
		default_value = [0, 0, 0, 1];
	
		//initialize attributes for vertex
		for (a in program_obj.attributes.active) {
			attrib_obj = program_obj.attributes.active[a];
	
			data = arrays[attrib_obj.location];
	
			if (buffer_obj = data.buffer_obj) {
				buffer_data = buffer_obj.getData(Float32Array);
				start = (data.pointer / buffer_data.BYTES_PER_ELEMENT) + (index * data.size + data.stride);
			} else {
				// but constant data was specified, so use that
				buffer_data = data.value;
				start = 0;
			}
	
			//@todo: add support for attributes using multiple slots
			GPU.memcpy(vertex.attributes, attrib_obj.location * 4, buffer_data, data.size, start);
			GPU.memcpy(vertex.attributes, attrib_obj.location * 4 + data.size, default_value, 4 - data.size, data.size);
		}
	}


}(cnvgl));

