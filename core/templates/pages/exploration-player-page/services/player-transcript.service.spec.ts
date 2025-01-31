// Copyright 2015 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for the player transcript service.
 */

import { TestBed } from '@angular/core/testing';

import { PlayerTranscriptService } from
  'pages/exploration-player-page/services/player-transcript.service';
import { StateCard } from 'domain/state_card/state-card.model';
import { AudioTranslationLanguageService } from
  'pages/exploration-player-page/services/audio-translation-language.service';
import { Interaction } from 'domain/exploration/InteractionObjectFactory';
import { RecordedVoiceovers } from 'domain/exploration/recorded-voiceovers.model';
import { WrittenTranslations } from 'domain/exploration/WrittenTranslationsObjectFactory';

describe('Player transcript service', () => {
  let pts: PlayerTranscriptService;
  let atls: AudioTranslationLanguageService;

  beforeEach(() => {
    pts = TestBed.inject(PlayerTranscriptService);
    atls = TestBed.inject(AudioTranslationLanguageService);
  });

  it('should reset the transcript correctly', () => {
    pts.addNewCard(StateCard.createNewCard(
      'First state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));
    pts.addNewCard(StateCard.createNewCard(
      'Second state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));

    expect(pts.getNumCards()).toBe(2);

    pts.init();
    expect(pts.getNumCards()).toBe(0);
    pts.addNewCard(StateCard.createNewCard(
      'Third state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));
    expect(pts.getCard(0).getStateName()).toBe('Third state');
  });

  it(
    'should correctly check whether a state have been encountered before',
    () => {
      pts.addNewCard(StateCard.createNewCard(
        'First state', 'Content HTML',
        '<oppia-text-input-html></oppia-text-input-html>',
        {} as Interaction, {} as RecordedVoiceovers,
        {} as WrittenTranslations, '', atls));
      pts.addNewCard(StateCard.createNewCard(
        'Second state', 'Content HTML',
        '<oppia-text-input-html></oppia-text-input-html>',
        {} as Interaction, {} as RecordedVoiceovers,
        {} as WrittenTranslations, '', atls));
      pts.addNewCard(StateCard.createNewCard(
        'First state', 'Content HTML',
        '<oppia-text-input-html></oppia-text-input-html>',
        {} as Interaction, {} as RecordedVoiceovers,
        {} as WrittenTranslations, '', atls));
      expect(pts.hasEncounteredStateBefore('First state')).toEqual(true);
      expect(pts.hasEncounteredStateBefore('Third state')).toEqual(false);
    });

  it('should add a new card correctly', () => {
    pts.addNewCard(StateCard.createNewCard(
      'First state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));

    let firstCard = pts.getCard(0);
    expect(firstCard.getStateName()).toEqual('First state');
    expect(firstCard.getContentHtml()).toEqual('Content HTML');
    expect(firstCard.getInteractionHtml()).toEqual(
      '<oppia-text-input-html></oppia-text-input-html>');
  });

  it('should add a previous card correctly', () => {
    pts.addNewCard(StateCard.createNewCard(
      'First state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));
    pts.addNewCard(StateCard.createNewCard(
      'Second state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));
    pts.addPreviousCard();

    expect(pts.getNumCards()).toEqual(3);
    expect(pts.getCard(0).getStateName()).toEqual('First state');
    expect(pts.getCard(1).getStateName()).toEqual('Second state');
    expect(pts.getCard(2).getStateName()).toEqual('First state');
  });

  it('should set lastAnswer correctly', () => {
    pts.addNewCard(StateCard.createNewCard(
      'First state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));
    let lastAnswer = pts.getLastAnswerOnDisplayedCard(0);
    expect(lastAnswer).toEqual(null);

    pts.addNewInput('first answer', false);
    pts.addNewCard(StateCard.createNewCard(
      'Second state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));
    lastAnswer = pts.getLastAnswerOnDisplayedCard(0);
    expect(lastAnswer).toEqual('first answer');

    pts.addNewCard(StateCard.createNewCard(
      'Third state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));
    // Variable lastAnswer should be null as no answers were provided in the
    // second state.
    lastAnswer = pts.getLastAnswerOnDisplayedCard(1);
    expect(lastAnswer).toEqual(null);
  });

  it('should record answer/feedback pairs in the correct order', () => {
    pts.addNewCard(StateCard.createNewCard(
      'First state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));
    pts.addNewInput('first answer', false);
    expect(() => {
      pts.addNewInput('invalid answer', false);
    }).toThrowError(
      'Trying to add an input before the response for the previous ' +
      'input has been received.');

    pts.addNewResponse('feedback');
    pts.addNewInput('second answer', true);

    let firstCard = pts.getCard(0);
    expect(firstCard.getInputResponsePairs()).toEqual([{
      learnerInput: 'first answer',
      oppiaResponse: 'feedback',
      isHint: false
    }, {
      learnerInput: 'second answer',
      oppiaResponse: null,
      isHint: true
    }]);
    expect(pts.getNumSubmitsForLastCard()).toBe(1);
  });

  it('should retrieve the last card of the transcript correctly', () => {
    pts.addNewCard(StateCard.createNewCard(
      'First state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));
    pts.addNewCard(StateCard.createNewCard(
      'Second state', 'Content HTML',
      '<oppia-text-input-html></oppia-text-input-html>',
      {} as Interaction, {} as RecordedVoiceovers,
      {} as WrittenTranslations, '', atls));
    expect(pts.getNumCards()).toBe(2);
    expect(pts.getLastCard().getStateName()).toBe('Second state');
    expect(pts.isLastCard(0)).toBe(false);
    expect(pts.isLastCard(1)).toBe(true);
    expect(pts.isLastCard(2)).toBe(false);
    expect(pts.getLastStateName()).toBe('Second state');

    expect(pts.getNumSubmitsForLastCard()).toBe(0);
    pts.addNewInput('first answer', false);
    expect(pts.getNumSubmitsForLastCard()).toBe(1);
    pts.addNewResponse('first feedback');
    expect(pts.getNumSubmitsForLastCard()).toBe(1);
    pts.addNewInput('second answer', false);
    expect(pts.getNumSubmitsForLastCard()).toBe(2);
  });
});
