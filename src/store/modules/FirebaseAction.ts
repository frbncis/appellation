import {
  Action as Act, ActionContext, Module as Mod, Payload,
} from 'vuex';
import { getModule, VuexModule } from 'vuex-module-decorators';
import { firestoreAction } from 'vuexfire';
import { ActionDecoratorParams } from 'vuex-module-decorators/dist/types/action';
import { firestore } from 'firebase';
import { FirestoreOptions } from '@posva/vuefire-core/dist/packages/@posva/vuefire-core/src';

interface FirestoreActionContext<S, R> extends ActionContext<S, R> {
    bindFirestoreRef(key: string, ref: firestore.Query | firestore.CollectionReference, options?: FirestoreOptions): Promise<firestore.DocumentData[]>;
    bindFirestoreRef(key: string, ref: firestore.DocumentReference, options?: FirestoreOptions): Promise<firestore.DocumentData>;
    unbindFirestoreRef(key: string): void;
}

export declare class FirestoreVuexModule<S = ThisType<any>, R = any> extends VuexModule<S, R> {
    context: FirestoreActionContext<S, R>;

  // constructor(m: any) {}
}

function firestoreActionDecoratorFactory<T>(params?: ActionDecoratorParams): MethodDecorator {
  const { commit = undefined, rawError = false, root = false } = params || {};
  return function (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    const module = target.constructor as Mod<T, any>;
    if (!module.actions) {
      module.actions = {};
    }
    const actionFunction: Function = descriptor.value;

    const action: Act<typeof target, any> = async function (
      context: ActionContext<typeof target, any>,
      payload: Payload,
    ) {
      try {
        let actionPayload = null;

        if ((module as any)._genStatic) {
          const moduleAccessor = getModule(module as typeof VuexModule);
          moduleAccessor.context = context;
          actionPayload = await actionFunction.call(moduleAccessor, payload);
        } else {
          const thisObj = { context };
          actionPayload = await actionFunction.call(thisObj, payload);
        }
        return actionPayload;
      } catch (e) {
        throw rawError
          ? e
          : new Error(
            `${new Error(`Could not perform action ${key.toString()}`).stack
            }\n${
              e.stack}`,
          );
      }
    };

    const fbindAction = firestoreAction(action);

    module.actions[key as string] = root ? { root, handler: action } : fbindAction;
  };
}

export function FirestoreAction<T, R>(
  target: T,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => R>
): void
export function FirestoreAction<T>(params: ActionDecoratorParams): MethodDecorator

/**
 * The @Action decorator turns an async function into an Vuex action
 *
 * @param targetOrParams the module class
 * @param key name of the action
 * @param descriptor the action function descriptor
 * @constructor
 */
export function FirestoreAction<T, R>(
  targetOrParams: T | ActionDecoratorParams,
  key?: string | symbol,
  descriptor?: TypedPropertyDescriptor<(...args: any[]) => R>,
) {
  if (!key && !descriptor) {
    /*
     * This is the case when `targetOrParams` is params.
     * i.e. when used as -
     * <pre>
        @Action({commit: 'incrCount'})
        async getCountDelta() {
          return 5
        }
     * </pre>
     */
    return firestoreActionDecoratorFactory(targetOrParams as ActionDecoratorParams);
  }
  /*
     * This is the case when @Action is called on action function
     * without any params
     * <pre>
     *   @Action
     *   async doSomething() {
     *    ...
     *   }
     * </pre>
     */
  firestoreActionDecoratorFactory()(targetOrParams, key!, descriptor!);
}
