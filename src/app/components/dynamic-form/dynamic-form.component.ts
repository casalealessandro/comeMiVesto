import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { DynamicFormField } from '../../service/interface/dynamic-form-field'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/service/app-service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],


})

export class DynamicFormComponent implements OnInit {


  @Input() service: string | undefined;
  @Input() editData: any  | undefined;
  @Input() btnFormText:string ='Salva';

  @Output() submitFormEvent: EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;
  form: FormGroup = new FormGroup({});
  formValues: { [key: string]: any } = {};
  dataSet: any = []
  fields: DynamicFormField[] = [];
  formShow: boolean = false
  fieldConfigs: any = [];
  labelplacement:'fixed' | 'stacked' | 'floating' = 'stacked';
  
  constructor(private templateService: AppService, private formBuilder: FormBuilder,private toastController: ToastController) {


  }

  ngOnInit(): void {

    if (!this.service) {
      return
    }
    if (typeof this.editData === 'undefined') {
      this.editData = {};
    }
    this.templateService.getFormFields(this.service).subscribe(fields => {
      this.fields = fields;
      this.initializeForm();
    });


  }

  initializeForm() {
    // Inizializza editData come oggetto vuoto se è undefined
    this.editData = this.editData || {};
  
    const formGroup = new FormGroup({});
  
    this.fields.forEach(field => {
      let validators = this.getValidators(field);
      
      // Recupera il valore dall'editData o imposta null come valore predefinito
      const value = this.editData[field.name] || null;
  
      // Aggiungi il controllo al formGroup con i validatori come terzo argomento
      formGroup.addControl(field.name, new FormControl(value, validators));
  
      // Inizializza i valori del form
      this.initializeFormValues(field);
    });
  
    this.form = formGroup;
  }
  
  // Metodo separato per gestire i validatori
  private getValidators(field: DynamicFormField) {
    const validators = [];
  
    if (field.required) {
      validators.push(Validators.required);
    }
    if (typeof field.minlength !== 'undefined') {
      validators.push(Validators.minLength(field.minlength));
    }
    if (typeof field.maxlength !== 'undefined') {
      validators.push(Validators.maxLength(field.maxlength));
    }
  
    return validators;
  }
  
  

  initializeFormValues(field: any) {

    //this.formValues[field.name] = field.type === 'selectBox' && field.multiple ? [] : '';
    
    if(typeof this.editData[field.name] != 'undefined'){
      this.formValues[field.name] = this.editData[field.name];
      //this.formValues[field.name] = field.type === 'selectBox' && field.multiple ? this.editData[field.name] : this.editData[field.name];
      
    }

    this.fieldConfigs[field.name] = field
  }

  onValueChange(fieldName: string, value: any) {
   
    
    
    const control = this.form.get(fieldName);

    if (control && control.value !== value) {
    /*
    { emitEvent: false }, Angular non emette l'evento valueChanges per il controllo specificato. Questo è utile in diverse situazioni come  Evitare Loop Ricorsivi
    */
      control.setValue(value, { emitEvent: false });
      this.formValues[fieldName] = value;
    }
   
    // Trigger cascade updates
    if (this.fieldConfigs[fieldName]) {
      this.updateCascadeOptions(fieldName, value);
    }
  }

  updateCascadeOptions(fieldName: string, value: any) {
    const fieldConfig = this.fieldConfigs[fieldName];
    if (fieldConfig && fieldConfig.cascadeFrom) {

      if (fieldName === fieldConfig.cascadeFrom) {

        const updatedOptions = fieldConfig.cascadeOptions[value] || [];
        this.formValues[fieldName] = updatedOptions;

      }

    }
  }


  submitForm() {
    if (this.form.valid) {
      this.submitFormEvent.emit(this.form.value);
    } else {
      const invalidFields = this.getInvalidFields(this.form);


      this.presentToast(`Mancano i seguenti campi:${invalidFields.join(', ')}`);
    }
  }

  // Metodo per ottenere i campi non validi
getInvalidFields(formGroup: FormGroup): string[] {
  const invalidFields: string[] = [];

  Object.keys(formGroup.controls).forEach(field => {
    const control = formGroup.get(field);
    if (control && control.invalid) {

      let ff = this.fieldConfigs[field].label
      invalidFields.push(ff);
    }
  });

  return invalidFields;
}

async presentToast(message: string) {
  const toast = await this.toastController.create({
    message: message,
    duration: 4500, // Tempo di visualizzazione in millisecondi
    position: 'bottom', // Può essere 'top', 'middle' o 'bottom'
  });
  toast.present();
}

}
