/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ClientConfigurationError } from "../error/ClientConfigurationError";
import { StringUtils } from "../utils/StringUtils";
import { ClientAuthError } from "../error/ClientAuthError";

/**
 * The ScopeSet class creates a set of scopes. Scopes are case-insensitive, unique values, so the Set object in JS makes
 * the most sense to implement for this class. All scopes are trimmed and converted to lower case strings to ensure uniqueness of strings.
 */
export class ScopeSet {;
    // Scopes as a Set of strings
    private scopes: Set<string>;

    constructor(inputScopes: Array<string>) {
        // Filter empty string and null/undefined array items
        const scopeArr = inputScopes ? StringUtils.trimAndConvertArrayEntriesToLowerCase([...inputScopes]) : [];
        const filteredInput = scopeArr ? StringUtils.removeEmptyStringsFromArray(scopeArr) : [];

        // Validate and filter scopes (validate function throws if validation fails)
        this.validateInputScopes(filteredInput);

        this.scopes = new Set<string>(filteredInput);
    }

    /**
     * Factory method to create ScopeSet from space-delimited string
     * @param inputScopeString
     * @param appClientId
     * @param scopesRequired
    */
    static fromString(inputScopeString: string): ScopeSet {
        inputScopeString = inputScopeString || "";
        const inputScopes: Array<string> = inputScopeString.split(" ");
        return new ScopeSet(inputScopes);
    }

    /**
     * Used to validate the scopes input parameter requested  by the developer.
     * @param {Array<string>} inputScopes - Developer requested permissions. Not all scopes are guaranteed to be included in the access token returned.
     * @param {boolean} scopesRequired - Boolean indicating whether the scopes array is required or not
    */
    private validateInputScopes(inputScopes: Array<string>): void {
        // Check if scopes are required but not given or is an empty array
        if (!inputScopes || inputScopes.length < 1) {
            throw ClientConfigurationError.createEmptyScopesArrayError(inputScopes);
        }
    }

    /**
     * Check if a given scope is present in this set of scopes.
     * @param scope
     */
    containsScope(scope: string): boolean {
        return !StringUtils.isEmpty(scope) ? this.scopes.has(scope) : false;
    }

    /**
     * Check if a set of scopes is present in this set of scopes.
     * @param scopeSet
     */
    containsScopeSet(scopeSet: ScopeSet): boolean {
        if (!scopeSet) {
            return false;
        }

        return (this.scopes.size >= scopeSet.scopes.size && scopeSet.asArray().every(scope => this.containsScope(scope)));
    }

    /**
     * Appends single scope if passed
     * @param newScope
     */
    appendScope(newScope: string): void {
        if (StringUtils.isEmpty(newScope)) {
            throw ClientAuthError.createAppendEmptyScopeToSetError(newScope);
        }
        this.scopes.add(newScope.trim().toLowerCase());
    }

    /**
     * Appends multiple scopes if passed
     * @param newScopes
     */
    appendScopes(newScopes: Array<string>): void {
        try {
            newScopes.forEach(newScope => this.scopes.add(newScope));
        } catch (e) {
            throw ClientAuthError.createAppendScopeSetError(e);
        }
    }

    /**
     * Removes element from set of scopes.
     * @param scope
     */
    removeScope(scope: string): void {
        if (StringUtils.isEmpty(scope)) {
            throw ClientAuthError.createRemoveEmptyScopeFromSetError(scope);
        }
        this.scopes.delete(scope.trim().toLowerCase());
    }

    /**
     * Combines an array of scopes with the current set of scopes.
     * @param otherScopes
     */
    unionScopeSets(otherScopes: ScopeSet): Set<string> {
        if (!otherScopes) {
            throw ClientAuthError.createEmptyInputScopeSetError(otherScopes);
        }
        return new Set<string>([...otherScopes.asArray(), ...Array.from(this.scopes)]);
    }

    /**
     * Check if scopes intersect between this set and another.
     * @param otherScopes 
     */
    intersectingScopeSets(otherScopes: ScopeSet): boolean {
        if (!otherScopes) {
            throw ClientAuthError.createEmptyInputScopeSetError(otherScopes);
        }

        const unionScopes = this.unionScopeSets(otherScopes);

        // Do not allow offline_access to be the only intersecting scope
        const sizeOtherScopes = otherScopes.getScopeCount();
        const sizeThisScopes = this.getScopeCount();
        const sizeUnionScopes = unionScopes.size;
        return sizeUnionScopes < (sizeThisScopes + sizeOtherScopes);
    }

    /**
     * Returns size of set of scopes.
     */
    getScopeCount(): number {
        return this.scopes.size;
    }

    /**
     * Returns the scopes as an array of string values
     */
    asArray(): Array<string> {
        return Array.from(this.scopes);
    }

    /**
     * Prints scopes into a space-delimited string
     */
    printScopes(): string {
        if (this.scopes) {
            const scopeArr = this.asArray();
            return scopeArr.join(" ");
        }
        return "";
    }
}