import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HashAlgorithmEnum } from 'src/app/models/enums/hashAlgorithm.enum';
import { passwordMatch } from 'src/app/shared/customValidators/passwordMatch.validator';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {

  hashAlgorithmEnum = HashAlgorithmEnum;

  hidePassword = true;
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.initializeForm();
  }

  ngOnInit() {
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      username: ['', Validators.compose([
        Validators.required
      ])],
      hashAlgorithm: [HashAlgorithmEnum.SHA512, Validators.compose([
        Validators.required
      ])],
      password: ['', Validators.compose([
        Validators.required
      ])],
      confirmPassword: ['', Validators.compose([
        Validators.required
      ])],
    }, { validators: passwordMatch('password', 'confirmPassword') });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  }

}
