import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionLogModalComponent } from './action-log-modal.component';

describe('ChangePasswordModalComponent', () => {
  let component: ActionLogModalComponent;
  let fixture: ComponentFixture<ActionLogModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActionLogModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionLogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
