import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { determineSessionStatus } from './parser';
import { setHookState, clearHookState } from './hookState';

describe('determineSessionStatus', () => {
  const testProjectPath = 'C:\\test\\project';
  const lastUpdated = Date.now();
  const emptyTodos: any[] = [];

  afterEach(() => {
    clearHookState(testProjectPath);
  });

  describe('Hook イベントによる状態判定', () => {
    it('SessionStart イベントで running 状態を返す', () => {
      // Given
      setHookState(testProjectPath, 'SessionStart');

      // When
      const status = determineSessionStatus(lastUpdated, emptyTodos, testProjectPath);

      // Then
      expect(status).toBe('running');
    });

    it('Stop イベントで idle 状態を返す', () => {
      // Given
      setHookState(testProjectPath, 'Stop');

      // When
      const status = determineSessionStatus(lastUpdated, emptyTodos, testProjectPath);

      // Then
      expect(status).toBe('idle');
    });

    it('PermissionRequest イベントで permission_waiting 状態を返す', () => {
      // Given
      setHookState(testProjectPath, 'PermissionRequest');

      // When
      const status = determineSessionStatus(lastUpdated, emptyTodos, testProjectPath);

      // Then
      expect(status).toBe('permission_waiting');
    });
  });
});
