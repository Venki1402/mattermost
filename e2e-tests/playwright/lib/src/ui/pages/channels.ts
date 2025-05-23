// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Page} from '@playwright/test';

import {ChannelsPost, components} from '@/ui/components';

export default class ChannelsPage {
    readonly channels = 'Channels';

    readonly page: Page;

    readonly globalHeader;
    readonly userAccountMenuButton;
    readonly searchPopover;
    readonly centerView;
    readonly scheduledDraftDropdown;
    readonly scheduledDraftModal;
    readonly sidebarLeft;
    readonly sidebarRight;
    readonly appBar;
    readonly userProfilePopover;
    readonly messagePriority;

    readonly findChannelsModal;
    readonly deletePostModal;
    readonly settingsModal;
    readonly profileModal;
    readonly postContainer;
    readonly postDotMenu;
    readonly postReminderMenu;
    readonly userAccountMenu;
    readonly emojiGifPickerPopup;

    constructor(page: Page) {
        this.page = page;

        // The main areas of the app
        this.globalHeader = new components.GlobalHeader(this, page.locator('#global-header'));
        this.searchPopover = new components.SearchPopover(page.locator('#searchPopover'));
        this.centerView = new components.ChannelsCenterView(page.getByTestId('channel_view'));
        this.sidebarLeft = new components.ChannelsSidebarLeft(page.locator('#SidebarContainer'));
        this.sidebarRight = new components.ChannelsSidebarRight(page.locator('#sidebar-right'));
        this.appBar = new components.ChannelsAppBar(page.locator('.app-bar'));
        this.messagePriority = new components.MessagePriority(page.locator('body'));
        this.userAccountMenuButton = page.getByRole('button', {name: "User's account menu"});

        // Modals
        this.findChannelsModal = new components.FindChannelsModal(page.getByRole('dialog', {name: 'Find Channels'}));
        this.deletePostModal = new components.DeletePostModal(page.locator('#deletePostModal'));
        this.settingsModal = new components.SettingsModal(page.getByRole('dialog', {name: 'Settings'}));
        this.profileModal = new components.ProfileModal(page.getByRole('dialog', {name: 'Profile'}));

        // Menus
        this.postDotMenu = new components.PostDotMenu(page.getByRole('menu', {name: 'Post extra options'}));
        this.postReminderMenu = new components.PostReminderMenu(page.getByRole('menu', {name: 'Set a reminder for:'}));
        this.userAccountMenu = new components.UserAccountMenu(page.locator('#userAccountMenu'));

        // Popovers
        this.emojiGifPickerPopup = new components.EmojiGifPicker(page.locator('#emojiGifPicker'));
        this.scheduledDraftDropdown = new components.ScheduledDraftMenu(page.locator('#dropdown_send_post_options'));
        this.scheduledDraftModal = new components.ScheduledDraftModal(page.locator('div.modal-content'));
        this.userProfilePopover = new components.UserProfilePopover(page.locator('.user-profile-popover'));

        // Posts
        this.postContainer = page.locator('div.post-message__text');
    }

    async toBeVisible() {
        await this.centerView.toBeVisible();
    }

    async getLastPost() {
        return this.centerView.getLastPost();
    }

    async goto(teamName = '', channelName = '') {
        let channelsUrl = '/';
        if (teamName) {
            channelsUrl += `${teamName}`;
            if (channelName) {
                const prefix = channelName.startsWith('@') ? '/messages' : '/channels';
                channelsUrl += `${prefix}/${channelName}`;
            }
        }
        await this.page.goto(channelsUrl);
    }

    /**
     * `postMessage` posts a message in the current channel
     * @param message Message to post
     * @param files Files to attach to the message
     */
    async postMessage(message: string, files?: string[]) {
        await this.centerView.postMessage(message, files);
    }

    async openUserAccountMenu() {
        await this.userAccountMenuButton.click();
        await expect(this.userAccountMenu.container).toBeVisible();
        return this.userAccountMenu;
    }

    async openProfileModal() {
        await this.openUserAccountMenu();
        await this.userAccountMenu.profile.click();
        await expect(this.profileModal.container).toBeVisible();
        return this.profileModal;
    }

    async openProfilePopover(post: ChannelsPost) {
        // Find and click the post's user avatar to open the profile popover
        await post.hover();
        await post.profileIcon.click();

        // Wait for the profile popover to be visible
        const popover = this.userProfilePopover;
        await expect(popover.container).toBeVisible();

        return popover;
    }
}
