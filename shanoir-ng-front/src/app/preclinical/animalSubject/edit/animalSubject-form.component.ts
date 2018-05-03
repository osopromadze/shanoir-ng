import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Location } from '@angular/common';

import { PreclinicalSubject } from '../shared/preclinicalSubject.model';
import { AnimalSubject } from '../shared/animalSubject.model';
import { Subject } from '../shared/subject.model';
import { AnimalSubjectService } from '../shared/animalSubject.service';
import { Reference }   from '../../reference/shared/reference.model';
import { ReferenceService } from '../../reference/shared/reference.service';
import { Pathology }   from '../../pathologies/pathology/shared/pathology.model';
import { PathologyService } from '../../pathologies/pathology/shared/pathology.service';
import { SubjectPathology }   from '../../pathologies/subjectPathology/shared/subjectPathology.model';
import { SubjectPathologyService } from '../../pathologies/subjectPathology/shared/subjectPathology.service';
import { SubjectTherapy }   from '../../therapies/subjectTherapy/shared/subjectTherapy.model';
import { SubjectTherapyService } from '../../therapies/subjectTherapy/shared/subjectTherapy.service';
import { ImagedObjectCategory } from '../shared/imaged-object-category.enum';
import { Sex } from '../shared/sex.enum';

import * as PreclinicalUtils from '../../utils/preclinical.utils';
import { KeycloakService } from "../../../shared/keycloak/keycloak.service";
import { Mode } from "../../shared/mode/mode.model";
import { Modes } from "../../shared/mode/mode.enum";
import { ModesAware } from "../../shared/mode/mode.decorator";
import { ImagesUrlUtil } from '../../../shared/utils/images-url.util';
import { Enum } from "../../../shared/utils/enum";


@Component({
    selector: 'animalSubject-form',
    templateUrl: 'animalSubject-form.component.html',
    styleUrls: ['animalSubject-form.component.css'],
    providers: [AnimalSubjectService, ReferenceService, PathologyService, SubjectPathologyService, SubjectTherapyService]
})
    
@ModesAware
export class AnimalSubjectFormComponent implements OnInit {

    public preclinicalSubject: PreclinicalSubject = new PreclinicalSubject();
    @Output() closing = new EventEmitter();
    newSubjectForm: FormGroup;
    private mode:Mode = new Mode();
    private subjectId: number;
    private canModify: Boolean = false;
    species: Reference[] = [];
    strains: Reference[] = [];
    biotypes: Reference[] = [];
    providers: Reference[] = [];
    stabulations: Reference[] = [];
    references: Reference[] = [];
    private sexes: Enum[] = [];
    private addIconPath: string = ImagesUrlUtil.ADD_ICON_PATH;

    constructor(
        private animalSubjectService: AnimalSubjectService,
        private referenceService: ReferenceService,
        private pathologyService: PathologyService,
        private subjectPathologyService: SubjectPathologyService,
        private subjectTherapyService: SubjectTherapyService,
        private keycloakService: KeycloakService,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location) {

    }


    loadData() {
       
        this.referenceService.getReferencesByCategory(PreclinicalUtils.PRECLINICAL_CAT_SUBJECT).then(references => {
            this.references = references;
            this.sortReferences();
           
        });
    }


    getAnimalSubject(): void {
        this.route.queryParams
            .switchMap((queryParams: Params) => {
                let subjectId = queryParams['id'];
                let mode = queryParams['mode'];
                if (mode) {
                    this.mode.setModeFromParameter(mode);
                }
                if (subjectId) {
                    // view or edit mode
                    this.subjectId = subjectId;
                    this.preclinicalSubject.animalSubject.id = subjectId;
                    return this.animalSubjectService.getAnimalSubject(subjectId);
                } else {
                    // create mode
                    return Observable.of<AnimalSubject>();
                }
            })
            .subscribe(animalSubject => {
                if (!this.mode.isViewMode()) {
                    animalSubject.specie = this.getReferenceById(animalSubject.specie);
                    animalSubject.strain = this.getReferenceById(animalSubject.strain);
                    animalSubject.biotype = this.getReferenceById(animalSubject.biotype);
                    animalSubject.provider = this.getReferenceById(animalSubject.provider);
                    animalSubject.stabulation = this.getReferenceById(animalSubject.stabulation);
                }
                if (!this.mode.isCreateMode()) {
                	this.animalSubjectService.getSubject(animalSubject.subjectId).then((subject) => {
                		this.preclinicalSubject.id = animalSubject.id;
                    	this.preclinicalSubject.animalSubject = animalSubject;
                    	this.preclinicalSubject.subject = subject;
                	});
                }
            });

    }

    ngOnInit(): void {
        this.loadData();
        this.getSexes();
        this.preclinicalSubject.subject = new Subject();
        this.preclinicalSubject.animalSubject = new AnimalSubject();
        this.getAnimalSubject();
        if (this.mode.isCreateMode()) {
        	this.preclinicalSubject.subject.preclinical = true;
            this.preclinicalSubject.subject.imagedObjectCategory = ImagedObjectCategory.LIVING_HUMAN_BEING;
        }
        this.buildForm();
        if (this.keycloakService.isUserAdmin() || this.keycloakService.isUserExpert()) {
            this.canModify = true;
        }
    }
    
    getSexes(): void {
        var sex = Object.keys(Sex);
        for (var i = 0; i < sex.length; i = i + 2) {
            var newEnum: Enum = new Enum();
            newEnum.key = sex[i];
            newEnum.value = Sex[sex[i]];
            this.sexes.push(newEnum);
        }
    }
    
     displaySex(): boolean {
        if (this.animalSelected()) {
        	return true;
        } else {
            return false;
        }
    }
    
    public animalSelected(): boolean {
        return this.preclinicalSubject && this.preclinicalSubject.subject && this.preclinicalSubject.subject.imagedObjectCategory != null
            && (this.preclinicalSubject.subject.imagedObjectCategory.toString() != "PHANTOM"
                && this.preclinicalSubject.subject.imagedObjectCategory.toString() != "ANATOMICAL_PIECE");
    }
    
    

    buildForm(): void {
        this.newSubjectForm = this.fb.group({
            'identifier': [this.preclinicalSubject.subject.identifier, Validators.required],
            'specie': [this.preclinicalSubject.animalSubject.specie, Validators.required],
            'strain': [this.preclinicalSubject.animalSubject.strain, Validators.required],
            'biotype': [this.preclinicalSubject.animalSubject.biotype, Validators.required],
            'provider': [this.preclinicalSubject.animalSubject.provider, Validators.required],
            'stabulation': [this.preclinicalSubject.animalSubject.stabulation, Validators.required],
            'sex': [this.preclinicalSubject.subject.sex],
            'imagedObjectCategory': [this.preclinicalSubject.subject.imagedObjectCategory],
        });

        this.newSubjectForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }

    onValueChanged(data?: any) {
        if (!this.newSubjectForm) { return; }
        const form = this.newSubjectForm;
        for (const field in this.formErrors) {
            // clear previous error message (if any)
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                for (const key in control.errors) {
                    this.formErrors[field] += key;
                }
            }
        }
    }

    formErrors = {
        'identifier': '',
        'specie': '',
        'strain': '',
        'biotype': '',
        'provider': '',
        'stabulation': ''
    };

    getOut(preclinicalSubject: PreclinicalSubject = null): void {
        if (this.closing.observers.length > 0) {
            this.closing.emit(preclinicalSubject);
            this.location.back();
        } else {
            this.location.back();
        }
    }

    //params should be category and then reftype
    goToRefPage(...params: string[]): void {
        let category;
        let reftype;
        if (params && params[0]) category = params[0];
        if (params && params[1]) reftype = params[1];
        if (category && !reftype) this.router.navigate(['/preclinical/reference'], { queryParams: { mode: "create", category: category } });
        if (category && reftype) this.router.navigate(['/preclinical/reference'], { queryParams: { mode: "create", category: category, reftype: reftype } });
    }

    addSubject() {
        if (!this.preclinicalSubject ) { return; }
        this.animalSubjectService.createSubject(this.preclinicalSubject.subject)
            .subscribe(subject => {
            	this.preclinicalSubject.subject = subject;
            	this.preclinicalSubject.animalSubject.subjectId = subject.id;
            	// Add animalSubject
            	if (this.preclinicalSubject && this.preclinicalSubject.animalSubject){
            		this.animalSubjectService.create(this.preclinicalSubject.animalSubject)
            		 .subscribe(animalSubject => {
            		 	this.preclinicalSubject.id = animalSubject.id;
            		 	this.preclinicalSubject.animalSubject = animalSubject;
            		 	 //Then add pathologies
                		if (this.preclinicalSubject && this.preclinicalSubject.pathologies) {
                    		for (let patho of this.preclinicalSubject.pathologies) {
                        		//patho.subject = subject;
                        		this.subjectPathologyService.create(this.preclinicalSubject, patho)
                            		.subscribe(subjectPathology => {

                            	});
                    		}
                		}
                		//Then add therapies
                		if (this.preclinicalSubject && this.preclinicalSubject.therapies) {
                    		for (let therapy of this.preclinicalSubject.therapies) {
                        		this.subjectTherapyService.create(this.preclinicalSubject, therapy)
                            		.subscribe(subjectTherapy => {

                            		});
                    		}
                		}
                		this.getOut(this.preclinicalSubject);
            		 }
            		 );
            	}
            });
    }

    updateSubject(): void {
    	if (this.preclinicalSubject && this.preclinicalSubject.subject){	
        	this.animalSubjectService.updateSubject(this.preclinicalSubject.subject.id, this.preclinicalSubject.subject)
            	.subscribe(subject => {
            		if (this.preclinicalSubject.animalSubject){
            			this.animalSubjectService.update(this.preclinicalSubject.animalSubject)
            				.subscribe(animalSubject => {
            					//this.preclinicalSubject.animalSubject = animalSubject;
                				this.getOut(this.preclinicalSubject);
                			}
                		);
                	}
            	}
            );
        }
    }

    sortReferences() {
    if (this.references){
        for (let ref of this.references) {
            switch (ref.reftype) {
                case PreclinicalUtils.PRECLINICAL_SUBJECT_SPECIE:
                    this.species.push(ref);
                    break;
                case PreclinicalUtils.PRECLINICAL_SUBJECT_BIOTYPE:
                    this.biotypes.push(ref);
                    break;
                case PreclinicalUtils.PRECLINICAL_SUBJECT_STRAIN:
                    this.strains.push(ref);
                    break;
                case PreclinicalUtils.PRECLINICAL_SUBJECT_PROVIDER:
                    this.providers.push(ref);
                    break;
                case PreclinicalUtils.PRECLINICAL_SUBJECT_STABULATION:
                    this.stabulations.push(ref);
                    break;
                default:
                    break;
            }
        }
        }
    }

    getReferenceById(reference: any): Reference {
        if (reference) {
            for (let ref of this.references) {
                if (reference.id == ref.id) {
                    return ref;
                }
            }
        }
        return null;
    }
    
    
    public imagedObjectCategories() {
        return ImagedObjectCategory.keyValues();
    }
    

}