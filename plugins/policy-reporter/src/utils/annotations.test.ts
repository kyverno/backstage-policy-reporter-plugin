import {
  containsRequiredAnnotations,
  getNamespaces,
  getKinds,
  getResourceName,
} from './annotations';
import {
  KYVERNO_KIND_ANNOTATION,
  KYVERNO_NAMESPACE_ANNOTATION,
  KYVERNO_RESOURCE_NAME_ANNOTATION,
  KUBERNETES_NAMESPACE_ANNOTATION,
} from '@kyverno/backstage-plugin-policy-reporter-common';

describe('annotations utils', () => {
  describe('containsRequiredAnnotations', () => {
    it('should return true when all required annotations are present', () => {
      const annotations = {
        annotation1: 'value1',
        annotation2: 'value2',
        annotation3: 'value3',
      };
      const required = ['annotation1', 'annotation2'];

      const result = containsRequiredAnnotations(annotations, required);

      expect(result).toBe(true);
    });

    it('should return false when some required annotations are missing', () => {
      const annotations = {
        annotation1: 'value1',
        annotation3: 'value3',
      };
      const required = ['annotation1', 'annotation2'];

      const result = containsRequiredAnnotations(annotations, required);

      expect(result).toBe(false);
    });

    it('should return false when annotations is undefined', () => {
      const required = ['annotation1', 'annotation2'];

      const result = containsRequiredAnnotations(undefined, required);

      expect(result).toBe(false);
    });

    it('should return true when required array is empty', () => {
      const annotations = {
        annotation1: 'value1',
      };
      const required: string[] = [];

      const result = containsRequiredAnnotations(annotations, required);

      expect(result).toBe(true);
    });

    it('should return true when both annotations and required are empty', () => {
      const annotations = {};
      const required: string[] = [];

      const result = containsRequiredAnnotations(annotations, required);

      expect(result).toBe(true);
    });
  });

  describe('getNamespaces', () => {
    it('should return Kyverno namespace annotation as array when present', () => {
      const annotations = {
        [KYVERNO_NAMESPACE_ANNOTATION]: 'namespace1,namespace2,namespace3',
      };

      const result = getNamespaces(annotations);

      expect(result).toEqual(['namespace1', 'namespace2', 'namespace3']);
    });

    it('should trim whitespace from Kyverno namespace values', () => {
      const annotations = {
        [KYVERNO_NAMESPACE_ANNOTATION]:
          ' namespace1 , namespace2 , namespace3 ',
      };

      const result = getNamespaces(annotations);

      expect(result).toEqual(['namespace1', 'namespace2', 'namespace3']);
    });

    it('should return single Kyverno namespace as array', () => {
      const annotations = {
        [KYVERNO_NAMESPACE_ANNOTATION]: 'single-namespace',
      };

      const result = getNamespaces(annotations);

      expect(result).toEqual(['single-namespace']);
    });

    it('should fall back to Kubernetes namespace annotation when Kyverno annotation is not present', () => {
      const annotations = {
        [KUBERNETES_NAMESPACE_ANNOTATION]: 'kubernetes-namespace',
      };

      const result = getNamespaces(annotations);

      expect(result).toEqual(['kubernetes-namespace']);
    });

    it('should prioritize Kyverno annotation over Kubernetes annotation', () => {
      const annotations = {
        [KYVERNO_NAMESPACE_ANNOTATION]: 'kyverno-namespace',
        [KUBERNETES_NAMESPACE_ANNOTATION]: 'kubernetes-namespace',
      };

      const result = getNamespaces(annotations);

      expect(result).toEqual(['kyverno-namespace']);
    });

    it('should return empty array when no namespace annotations are present', () => {
      const annotations = {
        'other-annotation': 'value',
      };

      const result = getNamespaces(annotations);

      expect(result).toEqual([]);
    });

    it('should return empty array when annotations is undefined', () => {
      const result = getNamespaces(undefined);

      expect(result).toEqual([]);
    });

    it('should handle empty Kyverno namespace annotation', () => {
      const annotations = {
        [KYVERNO_NAMESPACE_ANNOTATION]: '',
      };

      const result = getNamespaces(annotations);

      expect(result).toEqual(['']);
    });

    it('should handle Kyverno namespace annotation with only commas and whitespace', () => {
      const annotations = {
        [KYVERNO_NAMESPACE_ANNOTATION]: ' , , ',
      };

      const result = getNamespaces(annotations);

      expect(result).toEqual(['', '', '']);
    });
  });

  describe('getKinds', () => {
    it('should return kinds array when Kyverno kind annotation is present', () => {
      const annotations = {
        [KYVERNO_KIND_ANNOTATION]: 'Pod,Service,Deployment',
      };

      const result = getKinds(annotations);

      expect(result).toEqual(['Pod', 'Service', 'Deployment']);
    });

    it('should trim whitespace from kind values', () => {
      const annotations = {
        [KYVERNO_KIND_ANNOTATION]: ' Pod , Service , Deployment ',
      };

      const result = getKinds(annotations);

      expect(result).toEqual(['Pod', 'Service', 'Deployment']);
    });

    it('should return single kind as array', () => {
      const annotations = {
        [KYVERNO_KIND_ANNOTATION]: 'Pod',
      };

      const result = getKinds(annotations);

      expect(result).toEqual(['Pod']);
    });

    it('should return empty array when kind annotation is not present', () => {
      const annotations = {
        'other-annotation': 'value',
      };

      const result = getKinds(annotations);

      expect(result).toEqual([]);
    });

    it('should return empty array when annotations is undefined', () => {
      const result = getKinds(undefined);

      expect(result).toEqual([]);
    });

    it('should handle empty kind annotation', () => {
      const annotations = {
        [KYVERNO_KIND_ANNOTATION]: '',
      };

      const result = getKinds(annotations);

      expect(result).toEqual(['']);
    });

    it('should handle kind annotation with only commas and whitespace', () => {
      const annotations = {
        [KYVERNO_KIND_ANNOTATION]: ' , , ',
      };

      const result = getKinds(annotations);

      expect(result).toEqual(['', '', '']);
    });
  });

  describe('getResourceName', () => {
    it('should return resource name when annotation is present', () => {
      const annotations = {
        [KYVERNO_RESOURCE_NAME_ANNOTATION]: 'my-resource',
      };

      const result = getResourceName(annotations);

      expect(result).toBe('my-resource');
    });

    it('should return empty string when resource name annotation is not present', () => {
      const annotations = {
        'other-annotation': 'value',
      };

      const result = getResourceName(annotations);

      expect(result).toBe('');
    });

    it('should return empty string when annotations is undefined', () => {
      const result = getResourceName(undefined);

      expect(result).toBe('');
    });

    it('should return empty string when resource name annotation is empty', () => {
      const annotations = {
        [KYVERNO_RESOURCE_NAME_ANNOTATION]: '',
      };

      const result = getResourceName(annotations);

      expect(result).toBe('');
    });

    it('should return resource name with special characters', () => {
      const annotations = {
        [KYVERNO_RESOURCE_NAME_ANNOTATION]: 'my-resource_123.test',
      };

      const result = getResourceName(annotations);

      expect(result).toBe('my-resource_123.test');
    });

    it('should handle undefined annotation value gracefully', () => {
      const annotations = {
        [KYVERNO_RESOURCE_NAME_ANNOTATION]: undefined as any,
      };

      const result = getResourceName(annotations);

      expect(result).toBe('');
    });
  });

  describe('integration tests', () => {
    it('should work with real-world Backstage entity annotations', () => {
      const entityAnnotations = {
        [KYVERNO_NAMESPACE_ANNOTATION]: 'production,staging',
        [KYVERNO_KIND_ANNOTATION]: 'Pod,Service',
        [KYVERNO_RESOURCE_NAME_ANNOTATION]: 'my-app',
        [KUBERNETES_NAMESPACE_ANNOTATION]: 'default', // Should be ignored due to priority
        'backstage.io/managed-by-location':
          'url:https://github.com/example/repo',
        'github.com/project-slug': 'example/repo',
      };

      const requiredAnnotations = [
        KYVERNO_NAMESPACE_ANNOTATION,
        KYVERNO_KIND_ANNOTATION,
        KYVERNO_RESOURCE_NAME_ANNOTATION,
      ];

      expect(
        containsRequiredAnnotations(entityAnnotations, requiredAnnotations),
      ).toBe(true);
      expect(getNamespaces(entityAnnotations)).toEqual([
        'production',
        'staging',
      ]);
      expect(getKinds(entityAnnotations)).toEqual(['Pod', 'Service']);
      expect(getResourceName(entityAnnotations)).toBe('my-app');
    });

    it('should handle minimal Backstage entity with only Kubernetes namespace', () => {
      const entityAnnotations = {
        [KUBERNETES_NAMESPACE_ANNOTATION]: 'default',
        'backstage.io/managed-by-location':
          'url:https://github.com/example/repo',
      };

      expect(getNamespaces(entityAnnotations)).toEqual(['default']);
      expect(getKinds(entityAnnotations)).toEqual([]);
      expect(getResourceName(entityAnnotations)).toBe('');
    });

    it('should handle entity with no relevant annotations', () => {
      const entityAnnotations = {
        'backstage.io/managed-by-location':
          'url:https://github.com/example/repo',
        'github.com/project-slug': 'example/repo',
      };

      const requiredAnnotations = [KYVERNO_NAMESPACE_ANNOTATION];

      expect(
        containsRequiredAnnotations(entityAnnotations, requiredAnnotations),
      ).toBe(false);
      expect(getNamespaces(entityAnnotations)).toEqual([]);
      expect(getKinds(entityAnnotations)).toEqual([]);
      expect(getResourceName(entityAnnotations)).toBe('');
    });
  });
});
