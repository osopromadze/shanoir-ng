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

import { Component, ViewChild } from '@angular/core';
import { BrowserPaginEntityListComponent } from '../../shared/components/entity/entity-list.browser.component.abstract';
import { TableComponent } from '../../shared/components/table/table.component';
import { DatasetAcquisition } from '../shared/dataset-acquisition.model';
import { DatasetAcquisitionService } from '../shared/dataset-acquisition.service';
import { AcquisitionEquipment } from '../../acquisition-equipments/shared/acquisition-equipment.model';
import { ManufacturerModel } from '../../acquisition-equipments/shared/manufacturer-model.model';
import { DatasetModalityType } from '../../enum/dataset-modality-type.enum';

@Component({
    selector: 'dataset-acquisition-list',
    templateUrl: 'dataset-acquisition-list.component.html',
    styleUrls: ['dataset-acquisition-list.component.css'],
})
export class DatasetAcquisitionListComponent extends BrowserPaginEntityListComponent<DatasetAcquisition> {
    
    @ViewChild('table') table: TableComponent;

    constructor(
            private datasetAcquisitionService: DatasetAcquisitionService) {
                
        super('dataset-acquisition');
    }

    getOptions() {
        return {
            new: false,
            view: true, 
            edit: this.keycloakService.isUserAdmin(), 
            delete: this.keycloakService.isUserAdmin()
        };
    }

    getEntities(): Promise<DatasetAcquisition[]> {
        return this.datasetAcquisitionService.getAll();
    }

    getColumnDefs(): any[] {
        let colDef: any[] = [
            {headerName: 'Id', field: 'id', type: 'number', width: '30px', defaultSortCol: true, defaultAsc: false},
            { headerName: "Acquisition Equipment", field: "acquisitionEquipment", 
                cellRenderer: (params: any) => this.transformAcqEq(params.data.acquisitionEquipment),
                route: (dsAcq: DatasetAcquisition) => '/acquisition-equipment/details/' + dsAcq.acquisitionEquipment.id
            },
            { headerName: "Study", field: "examination.study.name", defaultField: 'examination.study.id' },
            { headerName: "Examination date", type: 'date', cellRenderer: (params: any) => {
                return this.dateRenderer(params.data.startDate);
            }},    
            { headerName: "Center", field: "acquisitionEquipment.center.name"},
            { headerName: "StudyCard", field: "studyCard.name",
                route: (dsAcq: DatasetAcquisition) => dsAcq.studyCard ? '/study-card/details/' + dsAcq.studyCard.id : null
            }
        ];
        return colDef;       
    }

    getCustomActionsDefs(): any[] {
        return [];
    }

    transformAcqEq(acqEqpt: AcquisitionEquipment): string {
        if (!acqEqpt) return "";
        else if (!acqEqpt.manufacturerModel) return String(acqEqpt.id);
        else {
            let manufModel: ManufacturerModel = acqEqpt.manufacturerModel;
            return manufModel.manufacturer.name + " - " + manufModel.name + " " + (manufModel.magneticField ? (manufModel.magneticField + "T") : "")
                + " (" + DatasetModalityType[manufModel.datasetModalityType] + ") " + acqEqpt.serialNumber
        }
    }
}