import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareCredentialModalComponent } from './share-credential-modal.component';

describe('CredentialModalComponent', () => {
  let component: ShareCredentialModalComponent;
  let fixture: ComponentFixture<ShareCredentialModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareCredentialModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareCredentialModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
