import { HttpClient } from '@angular/common/http';
import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ScriptTagComponent } from '@matbia/matbia-directive/components/script-tag/script-tag.component';

declare var window: any;
declare var $: any;
declare var JotForm: any;

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
  imports: [SharedModule, ScriptTagComponent],
})
export class SurveyComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  pageTitle = 'Matbia Survey 1';

  private metaTagsList: Array<HTMLMetaElement> = [];

  formUrl = 'https://form.jotform.com/243164690867164';

  constructor(
    private metaTags: Meta,
    protected title: Title,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.title.setTitle(this.pageTitle);

    this.metaTagsList = this.metaTags.addTags([
      {
        property: 'og:url',
        content: 'https://form.jotform.com/243164690867164',
      },
      {
        property: 'og:description',
        content: 'Please click the link to complete this form.',
      },
      {
        name: 'slack-app-id',
        content: 'AHNMASS8M',
      },
      {
        property: 'og:image',
        content:
          'https://www.jotform.com/uploads/Parnes_Joel/form_files/Matbeia%20card%20-%20new%20-%20Poll%20Header1024_1.6446c3c87b0fb2.79973254.jpg',
      },
    ]);

    window.onload = () => {
      this.jotFormCode();
      this.changeDetectorRef.detectChanges();
    };
  }

  ngAfterContentInit(): void { }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    for (let index = 0; index < this.metaTagsList.length; index++) {
      const element = this.metaTagsList[index];
      this.metaTags.removeTagElement(element);
    }
  }

  private jotFormCode() {
    JotForm.newDefaultTheme = true;
    JotForm.extendsNewTheme = false;
    JotForm.singleProduct = false;
    JotForm.newPaymentUIForNewCreatedForms = true;
    JotForm.texts = {
      confirmEmail: 'E-mail does not match',
      pleaseWait: 'Please wait...',
      validateEmail: 'You need to validate this e-mail',
      confirmClearForm: 'Are you sure you want to clear the form',
      lessThan: 'Your score should be less than or equal to',
      incompleteFields: 'There are incomplete required fields. Please complete them.',
      required: 'This field is required.',
      requireOne: 'At least one field required.',
      requireEveryRow: 'Every row is required.',
      requireEveryCell: 'Every cell is required.',
      email: 'Enter a valid e-mail address',
      alphabetic: 'This field can only contain letters',
      numeric: 'This field can only contain numeric values',
      alphanumeric: 'This field can only contain letters and numbers.',
      cyrillic: 'This field can only contain cyrillic characters',
      url: 'This field can only contain a valid URL',
      currency: 'This field can only contain currency values.',
      fillMask: 'Field value must fill mask.',
      uploadExtensions: 'You can only upload following files:',
      noUploadExtensions: 'File has no extension file type (e.g. .txt, .png, .jpeg)',
      uploadFilesize: 'File size cannot be bigger than:',
      uploadFilesizemin: 'File size cannot be smaller than:',
      gradingScoreError: 'Score total should only be less than or equal to',
      inputCarretErrorA: 'Input should not be less than the minimum value:',
      inputCarretErrorB: 'Input should not be greater than the maximum value:',
      maxDigitsError: 'The maximum digits allowed is',
      minCharactersError: 'The number of characters should not be less than the minimum value:',
      maxCharactersError: 'The number of characters should not be more than the maximum value:',
      freeEmailError: 'Free email accounts are not allowed',
      minSelectionsError: 'The minimum required number of selections is ',
      maxSelectionsError: 'The maximum number of selections allowed is ',
      pastDatesDisallowed: 'Date must not be in the past.',
      dateLimited: 'This date is unavailable.',
      dateInvalid: 'This date is not valid. The date format is {format}',
      dateInvalidSeparate: 'This date is not valid. Enter a valid {element}.',
      ageVerificationError: 'You must be older than {minAge} years old to submit this form.',
      multipleFileUploads_typeError: '{file} has invalid extension. Only {extensions} are allowed.',
      multipleFileUploads_sizeError: '{file} is too large, maximum file size is {sizeLimit}.',
      multipleFileUploads_minSizeError: '{file} is too small, minimum file size is {minSizeLimit}.',
      multipleFileUploads_emptyError: '{file} is empty, please select files again without it.',
      multipleFileUploads_uploadFailed: 'File upload failed, please remove it and upload the file again.',
      multipleFileUploads_onLeave: 'The files are being uploaded, if you leave now the upload will be cancelled.',
      multipleFileUploads_fileLimitError: 'Only {fileLimit} file uploads allowed.',
      dragAndDropFilesHere_infoMessage: 'Drag and drop files here',
      chooseAFile_infoMessage: 'Choose a file',
      maxFileSize_infoMessage: 'Max. file size',
      generalError: 'There are errors on the form. Please fix them before continuing.',
      generalPageError: 'There are errors on this page. Please fix them before continuing.',
      wordLimitError: 'Too many words. The limit is',
      wordMinLimitError: 'Too few words.  The minimum is',
      characterLimitError: 'Too many Characters.  The limit is',
      characterMinLimitError: 'Too few characters. The minimum is',
      ccInvalidNumber: 'Credit Card Number is invalid.',
      ccInvalidCVC: 'CVC number is invalid.',
      ccInvalidExpireDate: 'Expire date is invalid.',
      ccInvalidExpireMonth: 'Expiration month is invalid.',
      ccInvalidExpireYear: 'Expiration year is invalid.',
      ccMissingDetails: 'Please fill up the credit card details.',
      ccMissingProduct: 'Please select at least one product.',
      ccMissingDonation: 'Please enter numeric values for donation amount.',
      disallowDecimals: 'Please enter a whole number.',
      restrictedDomain: 'This domain is not allowed',
      ccDonationMinLimitError: 'Minimum amount is {minAmount} {currency}',
      requiredLegend: 'All fields marked with * are required and must be filled.',
      geoPermissionTitle: 'Permission Denied',
      geoPermissionDesc: "Check your browser's privacy settings.",
      geoNotAvailableTitle: 'Position Unavailable',
      geoNotAvailableDesc: 'Location provider not available. Please enter the address manually.',
      geoTimeoutTitle: 'Timeout',
      geoTimeoutDesc: 'Please check your internet connection and try again.',
      selectedTime: 'Selected Time',
      formerSelectedTime: 'Former Time',
      cancelAppointment: 'Cancel Appointment',
      cancelSelection: 'Cancel Selection',
      noSlotsAvailable: 'No slots available',
      slotUnavailable: '{time} on {date} has been selected is unavailable. Please select another slot.',
      multipleError: 'There are {count} errors on this page. Please correct them before moving on.',
      oneError: 'There is {count} error on this page. Please correct it before moving on.',
      doneMessage: 'Well done! All errors are fixed.',
      invalidTime: 'Enter a valid time',
      doneButton: 'Done',
      reviewSubmitText: 'Review and Submit',
      nextButtonText: 'Next',
      prevButtonText: 'Previous',
      seeErrorsButton: 'See Errors',
      notEnoughStock: 'Not enough stock for the current selection',
      notEnoughStock_remainedItems: 'Not enough stock for the current selection ({count} items left)',
      soldOut: 'Sold Out',
      justSoldOut: 'Just Sold Out',
      selectionSoldOut: 'Selection Sold Out',
      subProductItemsLeft: '({count} items left)',
      startButtonText: 'START',
      submitButtonText: 'Submit',
      submissionLimit: 'Sorry! Only one entry is allowed. <br> Multiple submissions are disabled for this form.',
      reviewBackText: 'Back to Form',
      seeAllText: 'See All',
      progressMiddleText: 'of',
      fieldError: 'field has an error.',
      error: 'Error',
    };
    JotForm.newPaymentUI = true;
    JotForm.originalLanguage = 'en';
    JotForm.isFormViewTrackingAllowed = true;
    JotForm.replaceTagTest = true;
    JotForm.uploadServerURL = 'https://upload.jotform.com/upload';
    JotForm.clearFieldOnHide = 'disable';
    JotForm.submitError = 'jumpToFirstError';

    JotForm.init(function () {
      /*INIT-START*/
      if (window.JotForm && JotForm.accessible) $('input_34').setAttribute('tabindex', 0);
      if (window.JotForm && JotForm.accessible) $('input_35').setAttribute('tabindex', 0);
      if (window.JotForm && JotForm.accessible) $('input_37').setAttribute('tabindex', 0);
      JotForm.alterTexts({
        ageVerificationError: 'You must be older than {minAge} years old to submit this form.',
        alphabetic: 'This field can only contain letters',
        alphanumeric: 'This field can only contain letters and numbers.',
        cancelAppointment: 'Cancel Appointment',
        cancelSelection: 'Cancel Selection',
        ccDonationMinLimitError: 'Minimum amount is {minAmount} {currency}',
        ccInvalidCVC: 'CVC number is invalid.',
        ccInvalidExpireDate: 'Expire date is invalid.',
        ccInvalidExpireMonth: 'Expiration month is invalid.',
        ccInvalidExpireYear: 'Expiration year is invalid.',
        ccInvalidNumber: 'Credit Card Number is invalid.',
        ccMissingDetails: 'Please fill up the credit card details.',
        ccMissingDonation: 'Please enter numeric values for donation amount.',
        ccMissingProduct: 'Please select at least one product.',
        characterLimitError: 'Too many Characters.  The limit is',
        characterMinLimitError: 'Too few characters. The minimum is',
        chooseAFile_infoMessage: 'Choose a file',
        confirmClearForm: 'Are you sure you want to clear the form',
        confirmEmail: 'E-mail does not match',
        currency: 'This field can only contain currency values.',
        cyrillic: 'This field can only contain cyrillic characters',
        dateInvalid: 'This date is not valid. The date format is {format}',
        dateInvalidSeparate: 'This date is not valid. Enter a valid {element}.',
        dateLimited: 'This date is unavailable.',
        disallowDecimals: 'Please enter a whole number.',
        doneButton: 'Done',
        doneMessage: 'Well done! All errors are fixed.',
        dragAndDropFilesHere_infoMessage: 'Drag and drop files here',
        email: 'Enter a valid e-mail address',
        error: 'Error',
        fieldError: 'field has an error.',
        fillMask: 'Field value must fill mask.',
        formerSelectedTime: 'Former Time',
        freeEmailError: 'Free email accounts are not allowed',
        generalError: 'There are errors on the form. Please fix them before continuing.',
        generalPageError: 'There are errors on this page. Please fix them before continuing.',
        geoNotAvailableDesc: 'Location provider not available. Please enter the address manually.',
        geoNotAvailableTitle: 'Position Unavailable',
        geoPermissionDesc: "Check your browser's privacy settings.",
        geoPermissionTitle: 'Permission Denied',
        geoTimeoutDesc: 'Please check your internet connection and try again.',
        geoTimeoutTitle: 'Timeout',
        gradingScoreError: 'Score total should only be less than or equal to',
        incompleteFields: 'There are incomplete required fields. Please complete them.',
        inputCarretErrorA: 'Input should not be less than the minimum value:',
        inputCarretErrorB: 'Input should not be greater than the maximum value:',
        invalidTime: 'Enter a valid time',
        justSoldOut: 'Just Sold Out',
        lessThan: 'Your score should be less than or equal to',
        maxCharactersError: 'The number of characters should not be more than the maximum value:',
        maxDigitsError: 'The maximum digits allowed is',
        maxFileSize_infoMessage: 'Max. file size',
        maxSelectionsError: 'The maximum number of selections allowed is ',
        minCharactersError: 'The number of characters should not be less than the minimum value:',
        minSelectionsError: 'The minimum required number of selections is ',
        multipleError: 'There are {count} errors on this page. Please correct them before moving on.',
        multipleFileUploads_emptyError: '{file} is empty, please select files again without it.',
        multipleFileUploads_fileLimitError: 'Only {fileLimit} file uploads allowed.',
        multipleFileUploads_minSizeError: '{file} is too small, minimum file size is {minSizeLimit}.',
        multipleFileUploads_onLeave: 'The files are being uploaded, if you leave now the upload will be cancelled.',
        multipleFileUploads_sizeError: '{file} is too large, maximum file size is {sizeLimit}.',
        multipleFileUploads_typeError: '{file} has invalid extension. Only {extensions} are allowed.',
        multipleFileUploads_uploadFailed: 'File upload failed, please remove it and upload the file again.',
        nextButtonText: 'Next',
        noSlotsAvailable: 'No slots available',
        notEnoughStock: 'Not enough stock for the current selection',
        notEnoughStock_remainedItems: 'Not enough stock for the current selection ({count} items left)',
        noUploadExtensions: 'File has no extension file type (e.g. .txt, .png, .jpeg)',
        numeric: 'This field can only contain numeric values',
        oneError: 'There is {count} error on this page. Please correct it before moving on.',
        pastDatesDisallowed: 'Date must not be in the past.',
        pleaseWait: 'Please wait...',
        prevButtonText: 'Previous',
        progressMiddleText: 'of',
        required: 'This field is required.',
        requiredLegend: 'All fields marked with * are required and must be filled.',
        requireEveryCell: 'Every cell is required.',
        requireEveryRow: 'Every row is required.',
        requireOne: 'At least one field required.',
        restrictedDomain: 'This domain is not allowed',
        reviewBackText: 'Back to Form',
        reviewSubmitText: 'Review and Submit',
        seeAllText: 'See All',
        seeErrorsButton: 'See Errors',
        selectedTime: 'Selected Time',
        selectionSoldOut: 'Selection Sold Out',
        slotUnavailable: '{time} on {date} has been selected is unavailable. Please select another slot.',
        soldOut: 'Sold Out',
        startButtonText: 'START',
        submissionLimit:
          'Sorry! Only one entry is allowed. &lt;br&gt; Multiple submissions are disabled for this form.',
        submitButtonText: 'Submit',
        subProductItemsLeft: '({count} items left)',
        uploadExtensions: 'You can only upload following files:',
        uploadFilesize: 'File size cannot be bigger than:',
        uploadFilesizemin: 'File size cannot be smaller than:',
        url: 'This field can only contain a valid URL',
        validateEmail: 'You need to validate this e-mail',
        wordLimitError: 'Too many words. The limit is',
        wordMinLimitError: 'Too few words.  The minimum is',
      });
      /*INIT-END*/
    });

    setTimeout(function () {
      JotForm.paymentExtrasOnTheFly([
        null,
        null,
        { name: 'submit2', qid: '2', text: 'Submit', type: 'control_button' },
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        {
          description: '',
          name: 'WhatmadeyousignuptoMatbia',
          qid: '18',
          text: 'What made you sign up for Matbia?',
          type: 'control_radio',
        },
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        { description: '', name: 'email', qid: '29', subLabel: '', text: 'Email', type: 'control_email' },
        null,
        null,
        null,
        null,
        {
          description: '',
          name: 'whatSurprised',
          qid: '34',
          subLabel: '',
          text: 'What surprised you about Matbia? If there’s anything that you love about Matbia, please tell us about it.',
          type: 'control_textbox',
        },
        {
          description: '',
          name: 'inWhat',
          qid: '35',
          subLabel: '',
          text: 'In what way can Matbia be improved?',
          type: 'control_textbox',
        },
        {
          description: '',
          name: 'whichFeatures',
          qid: '36',
          text: 'Which features do you find most useful?',
          type: 'control_checkbox',
        },
        {
          description: '',
          name: 'isThere',
          qid: '37',
          subLabel: '',
          text: 'Is there anything else you’d like to share with us?',
          type: 'control_textbox',
        },
        null,
        {
          name: 'input39',
          qid: '39',
          text: 'Now that you’ve gotten started with Matbia, we’d love to hear from you about why you joined, as well as how the platform has been working for you',
          type: 'control_text',
        },
      ]);
    }, 20);

    JotForm.showJotFormPowered = '0';
    JotForm.poweredByText = 'Powered by Jotform';
    var all_spc: any = document.querySelectorAll("form[id='243164690867164'] .si" + 'mple' + '_spc');

    for (var i = 0; i < all_spc.length; i++) {
      all_spc[i].value = '243164690867164-243164690867164';
    }
  }

  submitForm(): void {
    const url = 'https://api.jotform.com/formInitCatchLogger/243164690867164';
    const formData = new FormData();

    formData.append('formID', '243164690867164');
    this.http.post(url, formData).subscribe(
      () => {},
      (error) => {
        console.error('Error submitting form:', error);
      }
    );
  }
}
