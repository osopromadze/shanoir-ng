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

import {Input, ViewChild, Component} from '@angular/core'

import { SubjectTherapy } from '../shared/subjectTherapy.model';
import { SubjectTherapyService } from '../shared/subjectTherapy.service';
import { PreclinicalSubject } from '../../../animalSubject/shared/preclinicalSubject.model';
import { TherapyType } from "../../../shared/enum/therapyType";
import { Frequency } from "../../../shared/enum/frequency";
import { ModesAware } from "../../../shared/mode/mode.decorator";
import { TableComponent } from '../../../../shared/components/table/table.component';
import { BrowserPaginEntityListComponent } from '../../../../shared/components/entity/entity-list.browser.component.abstract';
import { ShanoirError } from '../../../../shared/models/error.model';
import { ServiceLocator } from '../../../../utils/locator.service';
import { MsgBoxService } from '../../../../shared/msg-box/msg-box.service';


@Component({
    selector: 'subject-therapy-list',
    templateUrl: 'subjectTherapy-list.component.html',
    styleUrls: ['subjectTherapy-list.component.css'],
    providers: [SubjectTherapyService]
})


@ModesAware
export class SubjectTherapiesListComponent  extends BrowserPaginEntityListComponent<SubjectTherapy>{
    @Input() canModify: Boolean = false;
    @Input() preclinicalSubject: PreclinicalSubject; 
    public toggleFormST: boolean = false;
    public createSTMode: boolean = false;
    public therapySelected: SubjectTherapy;
   @ViewChild('subjectTherapiesTable') table: TableComponent;

    constructor(
        private subjectTherapyService: SubjectTherapyService) {
            super('preclinical-subject-therapy');
    }

    getEntities(): Promise<SubjectTherapy[]> {
        let subjectTherapies: SubjectTherapy[] = [];
        if (this.preclinicalSubject && this.preclinicalSubject.animalSubject && this.preclinicalSubject.animalSubject.id) {
            this.subjectTherapyService.getSubjectTherapies(this.preclinicalSubject).then(st => {
                subjectTherapies = st;
            })
        }
        return Promise.resolve(subjectTherapies);
    }
    
    getColumnDefs(): any[] {
        function dateRenderer(date) {
            if (date) {
                return new Date(date).toLocaleDateString();
            }
            return null;
        };
        function castToString(id: number) {
            return String(id);
        };
        function checkNullValue(value: any) {
            if (value) {
                return value;
            }
            return '';
        };
        function checkNullValueReference(reference: any) {
            if (reference) {
                return reference.value;
            }
            return '';
        };
        let colDef: any[] = [
            { headerName: "Therapy", field: "therapy.name" },
            {
                headerName: "Type", field: "therapy.therapyType", type: "Enum", cellRenderer: function(params: any) {
                    return TherapyType[params.data.therapy.therapyType];
                }
            },
            {
                headerName: "Dose", field: "dose", type: "dose", cellRenderer: function(params: any) {
                    return checkNullValue(params.data.dose);
                }
            },
            {
                headerName: "Dose Unit", field: "dose_unit.value", type: "reference", cellRenderer: function(params: any) {
                    return checkNullValueReference(params.data.dose_unit);
                }
            },
            {
                headerName: "Type", field: "frequency", type: "Enum", cellRenderer: function (params: any) {
                    return Frequency[params.data.frequency];
                }
            },
            {
                headerName: "Start Date", field: "startDate", type: "date", cellRenderer: function(params: any) {
                    return dateRenderer(params.data.startDate);
                }
            },
            {
                headerName: "End Date", field: "endDate", type: "date", cellRenderer: function(params: any) {
                    return dateRenderer(params.data.endDate);
                }
            }     
        ];
        return colDef;       
    }

    getCustomActionsDefs(): any[] {
        return [];
    }
    
    

    refreshList(newSubTherapy: SubjectTherapy) {
        this.getEntities(),
        this.refreshDisplay(true);
    }

    refreshDisplay(cancel: boolean) {
        this.toggleFormST = false;
        this.createSTMode = false;
    }

    
    protected openDeleteConfirmDialog = (entity: SubjectTherapy) => {
        if (!this.keycloakService.isUserAdminOrExpert()) return;
        this.confirmDialogService
            .confirm(
                'Delete', 'Are you sure you want to delete preclinical-subject-therapy n° ' + entity.id + ' ?',
                ServiceLocator.rootViewContainerRef
            ).subscribe(res => {
                if (res) {
                    this.subjectTherapyService.deleteSubjectTherapy(this.preclinicalSubject, entity).then(() => {
                        this.onDelete.next(entity);
                        this.table.refresh();
                        this.msgBoxService.log('info', 'The preclinical-subject-therapy sucessfully deleted');
                    }).catch(reason => {
                        if (reason && reason.error) {
                            this.onDelete.next(new ShanoirError(reason));
                            if (reason.error.code != 422) throw Error(reason);
                        }
                    });                    
                }
            })
    }
    


    viewSubjectTherapy = (therapy: SubjectTherapy) => {
        this.toggleFormST = true;
        this.createSTMode = false;
        this.therapySelected = therapy;
    }

    toggleSubjectTherapyForm() {
        if (this.toggleFormST == false) {
            this.toggleFormST = true;
        } else if (this.toggleFormST == true) {
            this.toggleFormST = false;
        } else {
            this.toggleFormST = true;
        }
        this.createSTMode = true;
        this.therapySelected = new SubjectTherapy();
    }

    

}