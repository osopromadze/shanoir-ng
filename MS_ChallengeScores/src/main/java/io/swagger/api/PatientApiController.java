/**
 * Shanoir NG - Import, manage and share neuroimaging data
 * Copyright (C) 2009-2019 Inria - https://www.inria.fr/
 * Contact us on https://project.inria.fr/shanoir/
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/gpl-3.0.html
 */

package io.swagger.api;

import org.shanoir.challengeScores.controller.PatientApiDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import io.swagger.annotations.ApiParam;
import io.swagger.model.Patients;

@javax.annotation.Generated(value = "class io.swagger.codegen.languages.SpringCodegen", date = "2016-10-11T09:18:12.164Z")

@Controller
public class PatientApiController implements PatientApi {

	@Autowired
	private PatientApiDelegate patientApiDelegate;

	public ResponseEntity<Void> deleteAllPatients() {
        return patientApiDelegate.deleteAll();
    }

	public ResponseEntity<Void> savePatient(
			@ApiParam(value = "id of the patient", required = true) @RequestParam(value = "id", required = true) Long id,
			@ApiParam(value = "name of the patient", required = true) @RequestParam(value = "name", required = true) String name) {

		return patientApiDelegate.savePatient(id, name);
	}

	public ResponseEntity<Void> updatePatients(@ApiParam(value = "the patients to save", required = true) @RequestBody Patients patients) {
		return patientApiDelegate.updatePatients(patients);
	}
}
