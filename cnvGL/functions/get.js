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


function glGetError() {
	var ctx, error;
	ctx = cnvgl_context.getCurrentContext();
	error = ctx.errorValue;
	ctx.errorValue = GL_NO_ERROR;
	return error;
}

function glGetBooleanv(pname, params) {
	__glGet(pname, params);
	params[0] = (params[0] == 0.0 ? GL_FALSE : GL_TRUE); 
}

function glGetDoublev(pname, params) {
	__glGet(pname, params);
	if (typeof params[0] == 'boolean') {
		params[0] = params[0] ? GL_TRUE : GL_FALSE;	
	}	
}

function glGetFloatv(pname, params) {
	__glGet(pname, params);
	if (typeof params[0] == 'boolean') {
		params[0] = params[0] ? GL_TRUE : GL_FALSE;	
	}	
}

function glGetIntegerv(pname, params) {
	__glGet(pname, params);
	if (typeof params[0] == 'boolean') {
		params[0] = params[0] ? GL_TRUE : GL_FALSE;	
	} else {
		params[0] = Math.round(params[0]);
	}
}

function __glGet(pname, params) {
	switch (pname) {
		case GL_MAX_VERTEX_ATTRIBS:
			params[0] = GPU.shader.MAX_VERTEX_ATTRIBS;
			return;
		case GL_MAX_FRAGMENT_UNIFORM_COMPONENTS:
			params[0] = GPU.shader.MAX_FRAGMENT_UNIFORM_COMPONENTS;
			return;
		default:
			console.log('todo: __glGet', pname);
	}
}
