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

(function(glsl, ARB, StdIO) {
		  
	var sprintf;

	sprint = StdIO.sprintf;

	function relocate(shader_obj, name, old_index, new_index, size) {
		var i, j, ins, code, oi;

		if (old_index == new_index) {
			return;	
		}
		
		code = shader_obj.object_code.body;
		for (i = 0; i < code.length; i++) {
			ins = code[i];
			
			//not an instruction object
			if (!ins.d) {
				continue;
			}
			
			//update for each slot
			for (j = 0; j < size; j++) {
				if (ins.d && ins.d.offset == old_index + j) {
					ins.d.addOffset(new_index - old_index + j);
				}
				if (ins.s1 && ins.s1.offset == old_index + j) {
					ins.s1.addOffset(new_index - old_index + j);
				}
				if (ins.s2 && ins.s2.offset == old_index + j) {
					ins.s2.addOffset(new_index - old_index + j);
				}
				if (ins.s3 && ins.s3.offset == old_index + j) {
					ins.s3.addOffset(new_index - old_index + j);
				}				
			}
		}
	}

	function addVarying(program_obj, shader_obj) {
		var attribs, i, attrib, location;

		attribs = shader_obj.object_code.fragment.attrib;

		for (i = 0; i < attribs.length; i++) {
			attrib = attribs[i];

			//check if already declared
			if (attrib_obj = program_obj.getActiveVarying(attrib.name)) {

				//already exists as different type
				if (attrib_obj.size != attrib.type_size) {
					throw new Error(sprintf("Varying '%s' redeclared with different type", attrib.name));
				}

				//adjust addresses
				relocate(shader_obj, attrib.name, attrib.location, attrib_obj.location, attrib.size);
				continue;
			}

			location = program_obj.getOpenSlot(program_obj.varying);
			attrib_obj = new cnvgl_program_var(attrib.name, location, attrib.type_size);

			relocate(shader_obj, attrib.name, attrib.location, location, attrib.size);

			program_obj.addActiveVarying(attrib_obj);
		}
	}

	function addAttributes(program_obj, shader_obj) {
		var attribs, i, j, attrib, location;

		attribs = shader_obj.object_code.vertex.attrib;

		for (i = 0; i < attribs.length; i++) {
			attrib = attribs[i];

			//check if already declared
			if (attrib_obj = program_obj.getActiveAttribute(attrib.name)) {
				if (attrib_obj.size != attrib.type_size) {
					throw new Error(sprintf("Attribute '%s' redeclared with different type", attrib.name));
				}
				//
				
				continue;
			}

			location = program_obj.getOpenSlot(program_obj.attributes);
			attrib_obj = new cnvgl_program_var(attrib.name, location, attrib.type_size);
			
			program_obj.addActiveAttribute(attrib_obj);
		}
	}

	function addUniforms(program_obj, shader_obj) {
		var uniforms, i, j, uniform, uniform_obj, location;

		constants = shader_obj.object_code.constants;
		uniforms = shader_obj.object_code.program.local;

		for (i = 0; i < constants.length; i++) {
			uniform = constants[i];

			location = program_obj.getOpenSlot(program_obj.uniforms);
			uniform_obj = new cnvgl_program_var("", location, 1);

			program_obj.addActiveUniform(uniform_obj);
		}

		for (i = 0; i < uniforms.length; i++) {
			uniform = uniforms[i];

			//check if already declared
			if (uniform_obj = program_obj.getActiveUniform(uniform.name)) {
				if (uniform_obj.size != uniform.type_size) {
					throw new Error(sprintf("Uniform '%s' redeclared with different type", uniform.name));
				}
				continue;
			}

			location = program_obj.getOpenSlot(program_obj.uniforms);
			uniform_obj = new cnvgl_program_var(uniform.name, location, uniform.type_size);

			program_obj.addActiveUniform(uniform_obj);
		}
	}

	function linkObject(program_obj, shader_obj) {
		var result, output;

		try {
			addAttributes(program_obj, shader_obj);
			addUniforms(program_obj, shader_obj);
			addVarying(program_obj, shader_obj);
		} catch (e) {
			glsl.errors.push(e);
			return false;
		}

		//do translation into native javascript
		result = ARB.translate(shader_obj.object_code, 'javascript');
		output = result ? ARB.output : null;

		return output;
	}

	function link(program_obj) {
		var i, status, shader_obj;
		status = 1;

		//reset
		program_obj.reset();

		for (i = 0; i < program_obj.attached_shaders.length; i++) {
			shader_obj = program_obj.attached_shaders[i];
			shader_obj.exec = linkObject(program_obj, shader_obj);
			status &= !!shader_obj.exec;
		}

		return status;
	}

	/**
	 * External interface
	 */
	glsl.link = link;

}(glsl, ARB, StdIO));

